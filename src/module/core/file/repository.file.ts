import { db } from "../../../core/db.core";
import { File } from "./models.file";
import { eq, and, ilike, or, count, desc } from "drizzle-orm";
import type { FileQueryParamsDTO, CreateFileDTO, UpdateFileDTO, FileTypeEnumDTO, FileResponseDTO, FilePaginatedResponseDTO } from "./dto.file";


export class FileRepository {
    async create(data: CreateFileDTO) {
        try {
            const [file] = await db.insert(File).values(data).returning();
            if (!file) {
                throw new Error("failed to save file data in db")
            } else {
                return;
            }
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: FileQueryParamsDTO) {
        try {
            const { id, type, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(File.id, id));
            if (type !== undefined) filters.push(eq(File.type, type))

            if (search) {
                filters.push(or(
                    ilike(File.type, `%${search}%`),
                    ilike(File.url, `%${search}%`),
                    ilike(File.size, `%${search}%`),
                    ilike(File.id, `%${search}%`),
                    ilike(File.createdAt, `%${search}%`),
                    ilike(File.updatedAt, `%${search}%`)
                ));
            }
            const whereClause = and(...filters);

            // Run both queries in parallel to save time
            const [data, totalCount] = await Promise.all([
                db.select().from(File).where(whereClause).orderBy(desc(File.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(File).where(whereClause)
            ]);

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch file. Check server logs.");
        }
    }

    async fetchFile(params: FileQueryParamsDTO) {
        try {
            const { id, type, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(File.id, id));
            if (type !== undefined) filters.push(eq(File.type, type))

            if (search) {
                filters.push(or(
                    ilike(File.type, `%${search}%`),
                    ilike(File.url, `%${search}%`),
                    ilike(File.size, `%${search}%`),
                    ilike(File.id, `%${search}%`),
                    ilike(File.createdAt, `%${search}%`),
                    ilike(File.updatedAt, `%${search}%`)
                ));
            }
            const whereClause = filters.length > 0 ? and(...filters) : undefined;

            const files = await db.select()
                .from(File)
                .where(whereClause)
                .orderBy(desc(File.createdAt))
                .limit(pageSize)
                .offset(offset);

            return files;
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch file. Check server logs.");
        }
    }

    async update(id: string, data: UpdateFileDTO) {
        try {
            const [file] = await db.update(File).set(data).where(eq(File.id, id)).returning();
            if (!file) {
                throw new Error("Failed to update file");
            } else {
                return file;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [file] = await db.delete(File).where(eq(File.id, id)).returning();
            if (!file) {
                throw new Error("Failed to delete file");
            } else {
                return file;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}