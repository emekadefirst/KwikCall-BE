import { db } from "../../../core/db.core";
import { News, NewsToFiles } from "./models.news";
import { File } from "../../core/file/models.file";
import { Category } from "../category/models.category";
import { eq, and, ilike, or, count, inArray, desc } from "drizzle-orm";
import type { NewsQueryParamsDTO, CreateNewsDTO, UpdateNewsDTO } from "./dto.news";


export class NewsRepository {
    async create(data: CreateNewsDTO) {
        try {
            const { fileIds, ...newsData } = data;
            const [news] = await db.insert(News).values(newsData).returning();
            if (!news) {
                throw new Error("Failed to save news data in db");
            }

            if (fileIds?.length) {
                await db.insert(NewsToFiles).values(
                    fileIds.map(fileId => ({ newsId: news.id, fileId }))
                );
            }

            return news;
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: NewsQueryParamsDTO) {
        try {
            const { id, status, categoryId, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(News.id, id));
            if (status !== undefined) filters.push(eq(News.status, status));
            if (categoryId) filters.push(eq(News.categoryId, categoryId));

            if (search) {
                filters.push(or(
                    ilike(News.title, `%${search}%`),
                    ilike(News.content, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run data + count queries in parallel
            const [data, totalCount] = await Promise.all([
                db.select().from(News).where(whereClause).orderBy(desc(News.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(News).where(whereClause)
            ]);

            // Fetch related files and categories in parallel
            const newsIds = data.map(n => n.id);
            const categoryIds = [...new Set(data.map(n => n.categoryId))];

            const [filesData, categories] = await Promise.all([
                newsIds.length
                    ? db.select({
                        newsId: NewsToFiles.newsId,
                        id: File.id,
                        url: File.url,
                        type: File.type,
                    }).from(NewsToFiles)
                        .innerJoin(File, eq(NewsToFiles.fileId, File.id))
                        .where(inArray(NewsToFiles.newsId, newsIds))
                    : [],
                categoryIds.length
                    ? db.select({ id: Category.id, title: Category.title })
                        .from(Category)
                        .where(inArray(Category.id, categoryIds))
                    : [],
            ]);

            const categoryMap = new Map(categories.map(c => [c.id, c]));

            const newsWithRelations = data.map(news => ({
                ...news,
                category: categoryMap.get(news.categoryId) || null,
                files: filesData
                    .filter(f => f.newsId === news.id)
                    .map(({ newsId, ...file }) => file),
            }));

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data: newsWithRelations
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch news. Check server logs.");
        }
    }

    async update(id: string, data: UpdateNewsDTO) {
        try {
            const { fileIds, ...newsData } = data;
            const [news] = await db.update(News).set(newsData).where(eq(News.id, id)).returning();
            if (!news) {
                throw new Error("Failed to update news");
            }

            if (fileIds !== undefined) {
                await db.delete(NewsToFiles).where(eq(NewsToFiles.newsId, id));
                if (fileIds.length) {
                    await db.insert(NewsToFiles).values(
                        fileIds.map(fileId => ({ newsId: id, fileId }))
                    );
                }
            }

            return news;
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [news] = await db.delete(News).where(eq(News.id, id)).returning();
            if (!news) {
                throw new Error("Failed to delete news");
            } else {
                return news;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
