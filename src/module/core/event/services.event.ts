import { EventRepository } from "./repository.event";
import { HTTPException } from 'hono/http-exception';
import slugify from "slugify";
import type {
    EventQueryParams,
    CreateEventInput,
    UpdateEventInput,
    EventPaginatedResponse,
    EventObject
} from "./dto.event";

export class EventService {
    private repo: EventRepository;

    constructor() {
        this.repo = new EventRepository();
    }

    async fetch(params: EventQueryParams): Promise<EventPaginatedResponse> {
        return await this.repo.fetch(params);
    }

    async create(data: CreateEventInput, hostId: string): Promise<EventObject> {
        // Fix for Error 1: Cast data to any to access slug, or just use title
        // Since we omitted slug from CreateEventInput, we handle it here
        const title = data.title;
        const baseSlug = slugify(title, { lower: true, strict: true });
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const finalData = {
            ...data,
            hostId,
            slug: uniqueSlug,
        };

        const event = await this.repo.create(finalData);
        if (!event) throw new HTTPException(500, { message: "Failed to create event" });
        return event as EventObject;

    }

    async update(id: string, userId: string, data: UpdateEventInput): Promise<EventObject> {
        // Fix for Error 3 & 5: Pass required pagination defaults to findOne
        const existing = await this.repo.findOne({id: id, hostId: userId});

        if (!existing) {
            throw new HTTPException(404, { message: "Event not found" });
        }

        if (existing.hostId !== userId) {
            throw new HTTPException(403, { message: "Forbidden: You are not the host" });
        }

        const updated = await this.repo.update(id, data);
        if (!updated) throw new HTTPException(500, { message: "Update failed" });

        return updated as EventObject;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const existing = await this.repo.findOne({ id: id, hostId: userId});

        if (!existing) {
            throw new HTTPException(404, { message: "Event not found" });
        }

        if (existing.hostId !== userId) {
            throw new HTTPException(403, { message: "Forbidden" });
        }

        return await this.repo.delete(id);
    }
}