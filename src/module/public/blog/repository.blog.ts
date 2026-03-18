import { db } from "../../../core/db.core";
import { Blog, BlogsToFiles } from "./models.blog";
import { File } from "../../core/file/models.file";
import { Category } from "../category/models.category";
import { eq, and, ilike, or, count, inArray, desc } from "drizzle-orm";
import type { BlogQueryParamsDTO, CreateBlogDTO, UpdateBlogDTO } from "./dto.blog";


export class BlogRepository {
    async create(data: CreateBlogDTO) {
        try {
            const { fileIds, ...blogData } = data;
            const [blog] = await db.insert(Blog).values(blogData).returning();
            if (!blog) {
                throw new Error("Failed to save blog data in db");
            }

            if (fileIds?.length) {
                await db.insert(BlogsToFiles).values(
                    fileIds.map(fileId => ({ blogId: blog.id, fileId }))
                );
            }

            return blog;
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: BlogQueryParamsDTO) {
        try {
            const { id, status, categoryId, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(Blog.id, id));
            if (status !== undefined) filters.push(eq(Blog.status, status));
            if (categoryId) filters.push(eq(Blog.categoryId, categoryId));

            if (search) {
                filters.push(or(
                    ilike(Blog.title, `%${search}%`),
                    ilike(Blog.content, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run data + count queries in parallel
            const [data, totalCount] = await Promise.all([
                db.select().from(Blog).where(whereClause).orderBy(desc(Blog.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Blog).where(whereClause)
            ]);

            // Fetch related files and categories in parallel
            const blogIds = data.map(b => b.id);
            const categoryIds = [...new Set(data.map(b => b.categoryId))];

            const [filesData, categories] = await Promise.all([
                blogIds.length
                    ? db.select({
                        blogId: BlogsToFiles.blogId,
                        id: File.id,
                        url: File.url,
                        type: File.type,
                    }).from(BlogsToFiles)
                        .innerJoin(File, eq(BlogsToFiles.fileId, File.id))
                        .where(inArray(BlogsToFiles.blogId, blogIds))
                    : [],
                categoryIds.length
                    ? db.select({ id: Category.id, title: Category.title })
                        .from(Category)
                        .where(inArray(Category.id, categoryIds))
                    : [],
            ]);

            const categoryMap = new Map(categories.map(c => [c.id, c]));

            const blogsWithRelations = data.map(blog => ({
                ...blog,
                category: categoryMap.get(blog.categoryId) || null,
                files: filesData
                    .filter(f => f.blogId === blog.id)
                    .map(({ blogId, ...file }) => file),
            }));

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data: blogsWithRelations
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch blogs. Check server logs.");
        }
    }

    async update(id: string, data: UpdateBlogDTO) {
        try {
            const { fileIds, ...blogData } = data;
            const [blog] = await db.update(Blog).set(blogData).where(eq(Blog.id, id)).returning();
            if (!blog) {
                throw new Error("Failed to update blog");
            }

            if (fileIds !== undefined) {
                await db.delete(BlogsToFiles).where(eq(BlogsToFiles.blogId, id));
                if (fileIds.length) {
                    await db.insert(BlogsToFiles).values(
                        fileIds.map(fileId => ({ blogId: id, fileId }))
                    );
                }
            }

            return blog;
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [blog] = await db.delete(Blog).where(eq(Blog.id, id)).returning();
            if (!blog) {
                throw new Error("Failed to delete blog");
            } else {
                return blog;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
