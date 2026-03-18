import { db } from "../../../core/db.core";
import { Faq } from "./models.faq";
import { Category } from "../category/models.category";
import { eq, and, ilike, or, count, inArray, desc } from "drizzle-orm";
import type { FaqQueryParamsDTO, CreateFaqDTO, UpdateFaqDTO } from "./dto.faq";


export class FaqRepository {
    async create(data: CreateFaqDTO) {
        try {
            const [faq] = await db.insert(Faq).values(data).returning();
            if (!faq) {
                throw new Error("Failed to save faq data in db");
            } else {
                return faq;
            }
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: FaqQueryParamsDTO) {
        try {
            const { id, status, categoryId, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(Faq.id, id));
            if (status !== undefined) filters.push(eq(Faq.status, status));
            if (categoryId) filters.push(eq(Faq.categoryId, categoryId));

            if (search) {
                filters.push(or(
                    ilike(Faq.question, `%${search}%`),
                    ilike(Faq.answer, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run data + count queries in parallel
            const [data, totalCount] = await Promise.all([
                db.select().from(Faq).where(whereClause).orderBy(desc(Faq.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Faq).where(whereClause)
            ]);

            // Fetch categories for the returned faqs
            const categoryIds = [...new Set(data.map(f => f.categoryId))];
            const categories = categoryIds.length
                ? await db.select({ id: Category.id, title: Category.title })
                    .from(Category)
                    .where(inArray(Category.id, categoryIds))
                : [];

            const categoryMap = new Map(categories.map(c => [c.id, c]));

            const faqsWithCategory = data.map(faq => ({
                ...faq,
                category: categoryMap.get(faq.categoryId) || null,
            }));

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data: faqsWithCategory
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch faqs. Check server logs.");
        }
    }

    async update(id: string, data: UpdateFaqDTO) {
        try {
            const [faq] = await db.update(Faq).set(data).where(eq(Faq.id, id)).returning();
            if (!faq) {
                throw new Error("Failed to update faq");
            } else {
                return faq;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [faq] = await db.delete(Faq).where(eq(Faq.id, id)).returning();
            if (!faq) {
                throw new Error("Failed to delete faq");
            } else {
                return faq;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
