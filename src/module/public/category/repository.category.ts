import { db } from "../../../core/db.core";
import { Category } from "./models.category";
import { eq, and, ilike, or, count, desc } from "drizzle-orm";
import type { CategoryQueryParamsDTO, CreateCategoryDTO, UpdateCategoryDTO } from "./dto.category";


export class CategoryRepository {
    async create(data: CreateCategoryDTO) {
        try {
            const [category] = await db.insert(Category).values(data).returning();
            if (!category) {
                throw new Error("Failed to save category data in db");
            } else {
                return category;
            }
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: CategoryQueryParamsDTO) {
        try {
            const { id, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(Category.id, id));

            if (search) {
                filters.push(or(
                    ilike(Category.title, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run both queries in parallel to save time
            const [data, totalCount] = await Promise.all([
                db.select().from(Category).where(whereClause).orderBy(desc(Category.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Category).where(whereClause)
            ]);

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch categories. Check server logs.");
        }
    }

    async update(id: string, data: UpdateCategoryDTO) {
        try {
            const [category] = await db.update(Category).set(data).where(eq(Category.id, id)).returning();
            if (!category) {
                throw new Error("Failed to update category");
            } else {
                return category;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [category] = await db.delete(Category).where(eq(Category.id, id)).returning();
            if (!category) {
                throw new Error("Failed to delete category");
            } else {
                return category;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
