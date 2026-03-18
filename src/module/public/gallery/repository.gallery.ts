import { db } from "../../../core/db.core";
import { Gallery, GalleryToFiles } from "./models.gallery";
import { File } from "../../core/file/models.file";
import { Category } from "../category/models.category";
import { eq, and, ilike, or, count, inArray, desc } from "drizzle-orm";
import type { GalleryQueryParamsDTO, CreateGalleryDTO, UpdateGalleryDTO } from "./dto.gallery";


export class GalleryRepository {
    async create(data: CreateGalleryDTO) {
        try {
            const { fileIds, ...galleryData } = data;
            const [gallery] = await db.insert(Gallery).values(galleryData).returning();
            if (!gallery) {
                throw new Error("Failed to save gallery data in db");
            }

            if (fileIds?.length) {
                await db.insert(GalleryToFiles).values(
                    fileIds.map(fileId => ({ galleryId: gallery.id, fileId }))
                );
            }

            return gallery;
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: GalleryQueryParamsDTO) {
        try {
            const { id, status, categoryId, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(Gallery.id, id));
            if (status !== undefined) filters.push(eq(Gallery.status, status));
            if (categoryId) filters.push(eq(Gallery.categoryId, categoryId));

            if (search) {
                filters.push(or(
                    ilike(Gallery.title, `%${search}%`),
                    ilike(Gallery.description, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run data + count queries in parallel
            const [data, totalCount] = await Promise.all([
                db.select().from(Gallery).where(whereClause).orderBy(desc(Gallery.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Gallery).where(whereClause)
            ]);

            // Fetch related files and categories in parallel
            const galleryIds = data.map(g => g.id);
            const categoryIds = [...new Set(data.map(g => g.categoryId))];

            const [filesData, categories] = await Promise.all([
                galleryIds.length
                    ? db.select({
                        galleryId: GalleryToFiles.galleryId,
                        id: File.id,
                        url: File.url,
                        type: File.type,
                    }).from(GalleryToFiles)
                        .innerJoin(File, eq(GalleryToFiles.fileId, File.id))
                        .where(inArray(GalleryToFiles.galleryId, galleryIds))
                    : [],
                categoryIds.length
                    ? db.select({ id: Category.id, title: Category.title })
                        .from(Category)
                        .where(inArray(Category.id, categoryIds))
                    : [],
            ]);

            const categoryMap = new Map(categories.map(c => [c.id, c]));

            const galleriesWithRelations = data.map(gallery => ({
                ...gallery,
                category: categoryMap.get(gallery.categoryId) || null,
                files: filesData
                    .filter(f => f.galleryId === gallery.id)
                    .map(({ galleryId, ...file }) => file),
            }));

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data: galleriesWithRelations
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch galleries. Check server logs.");
        }
    }

    async update(id: string, data: UpdateGalleryDTO) {
        try {
            const { fileIds, ...galleryData } = data;
            const [gallery] = await db.update(Gallery).set(galleryData).where(eq(Gallery.id, id)).returning();
            if (!gallery) {
                throw new Error("Failed to update gallery");
            }

            if (fileIds !== undefined) {
                await db.delete(GalleryToFiles).where(eq(GalleryToFiles.galleryId, id));
                if (fileIds.length) {
                    await db.insert(GalleryToFiles).values(
                        fileIds.map(fileId => ({ galleryId: id, fileId }))
                    );
                }
            }

            return gallery;
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [gallery] = await db.delete(Gallery).where(eq(Gallery.id, id)).returning();
            if (!gallery) {
                throw new Error("Failed to delete gallery");
            } else {
                return gallery;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
