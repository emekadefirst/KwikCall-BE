import { db } from "../../../core/db.core";
import { Subscriber } from "./models.subscriber";
import { eq, and, ilike, or, count, desc } from "drizzle-orm";
import type { SubscriberQueryParamsDTO, CreateSubscriberDTO, UpdateSubscriberDTO } from "./dto.subscriber";


export class SubscriberRepository {
    async create(data: CreateSubscriberDTO) {
        try {
            const [subscriber] = await db.insert(Subscriber).values(data).returning();
            if (!subscriber) {
                throw new Error("Failed to save subscriber data in db");
            } else {
                return subscriber;
            }
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async fetch(params: SubscriberQueryParamsDTO) {
        try {
            const { id, search, page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const filters = [];
            if (id) filters.push(eq(Subscriber.id, id));

            if (search) {
                filters.push(or(
                    ilike(Subscriber.email, `%${search}%`),
                ));
            }
            const whereClause = and(...filters);

            // Run both queries in parallel to save time
            const [data, totalCount] = await Promise.all([
                db.select().from(Subscriber).where(whereClause).orderBy(desc(Subscriber.createdAt)).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Subscriber).where(whereClause)
            ]);

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch subscribers. Check server logs.");
        }
    }

    async update(id: string, data: UpdateSubscriberDTO) {
        try {
            const [subscriber] = await db.update(Subscriber).set(data).where(eq(Subscriber.id, id)).returning();
            if (!subscriber) {
                throw new Error("Failed to update subscriber");
            } else {
                return subscriber;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [subscriber] = await db.delete(Subscriber).where(eq(Subscriber.id, id)).returning();
            if (!subscriber) {
                throw new Error("Failed to delete subscriber");
            } else {
                return subscriber;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}
