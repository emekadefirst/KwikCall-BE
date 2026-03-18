import { Event } from "./models.event";
import { db } from "../../../core/db.core";
import { eq, and, ilike, or, count, gte, lte, SQL } from "drizzle-orm";
import type { EventQueryParams, CreateEventInput, UpdateEventInput, EventPaginatedResponse } from "./dto.event";

export class EventRepository {
    private buildFilters(params: EventQueryParams): SQL | undefined {
        const { id, search, shortCode, slug, type, status, hostId, startTimeFrom, startTimeTo } = params;
        const filters: (SQL | undefined)[] = [
            id ? eq(Event.id, id) : undefined,
            shortCode ? eq(Event.shortCode, shortCode) : undefined,
            slug ? eq(Event.slug, slug) : undefined,
            type ? eq(Event.type, type) : undefined,
            status ? eq(Event.status, status) : undefined,
            hostId ? eq(Event.hostId, hostId) : undefined,
            startTimeFrom ? gte(Event.startTime, new Date(startTimeFrom)) : undefined,
            startTimeTo ? lte(Event.startTime, new Date(startTimeTo)) : undefined,
        ];

        if (search) {
            filters.push(or(
                ilike(Event.title, `%${search}%`),
                ilike(Event.description, `%${search}%`),
                ilike(Event.shortCode, `%${search}%`),
                ilike(Event.slug, `%${search}%`),
                ilike(Event.hostId, `%${search}%`),
                ilike(Event.type, `%${search}%`),
                ilike(Event.status, `%${search}%`)
            ));
        }

        const validFilters = filters.filter((f): f is SQL => !!f);
        return validFilters.length > 0 ? and(...validFilters) : undefined;
    }

    async create(data: CreateEventInput & { shortCode?: string }) {
        try {
            const eventData = {
                ...data,
                shortCode: data.shortCode || this.generateShortCode(),
            };
            const [event] = await db.insert(Event).values(eventData).returning();
            return event;
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    private generateShortCode(): string {
        // Generates a 6-character code like 'XJ9-K2P'
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async fetch(params: EventQueryParams): Promise<EventPaginatedResponse> {
        try {
            const { page = 1, pageSize = 10 } = params;
            const offset = (page - 1) * pageSize;
            const whereClause = this.buildFilters(params);

            // Execute count and data retrieval in parallel
            const [rawData, totalResult] = await Promise.all([
                db.select().from(Event).where(whereClause).limit(pageSize).offset(offset),
                db.select({ total: count() }).from(Event).where(whereClause)
            ]);

            const data = rawData.map(event => ({
                ...event,
                inviteesEmail: event.inviteesEmail as any
            }));

            return {
                page,
                pageSize,
                total: Number(totalResult[0]?.total || 0),
                data
            };
        } catch (error) {
            console.error(`Database Error:`, error);
            throw new Error("Failed to fetch events.");
        }
    }

    async findOne(id?: string, shortCode?: string, hostId?: string) {
        const whereClause = this.buildFilters({ id, shortCode, hostId } as any);
        if (!whereClause) return null;
        const [event] = await db
            .select()
            .from(Event)
            .where(whereClause)
            .limit(1);

        return event || null;
    }

    async update(id: string, data: UpdateEventInput) {
        try {
            const [event] = await db.update(Event)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(Event.id, id))
                .returning();
            return event;
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    async delete(id: string) {
        await db.delete(Event).where(eq(Event.id, id));
        return true;
    }
}