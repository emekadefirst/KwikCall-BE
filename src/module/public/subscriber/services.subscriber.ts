import { SubscriberRepository } from "./repository.subscriber";
import type {
    SubscriberQueryParamsDTO,
    UpdateSubscriberDTO,
    SubscriberResponseDTO,
    SubscriberPaginatedResponseDTO,
    CreateSubscriberDTO
} from "./dto.subscriber";
import { HTTPException } from 'hono/http-exception';

export class SubscriberService {
    private subscriberRepository: SubscriberRepository;

    constructor() {
        this.subscriberRepository = new SubscriberRepository();
    }

    async createSubscriber(data: CreateSubscriberDTO): Promise<SubscriberResponseDTO> {
        try {
            const subscriber = await this.subscriberRepository.create(data);
            return subscriber as SubscriberResponseDTO;
        } catch (error) {
            console.error("Subscriber Service [createSubscriber] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create subscriber"
            });
        }
    }

    async fetchSubscribers(params: SubscriberQueryParamsDTO): Promise<SubscriberPaginatedResponseDTO> {
        try {
            return await this.subscriberRepository.fetch(params) as SubscriberPaginatedResponseDTO;
        } catch (error) {
            console.error("Subscriber Service [fetchSubscribers] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch subscribers" });
        }
    }

    async updateSubscriber(id: string, data: UpdateSubscriberDTO): Promise<SubscriberResponseDTO> {
        try {
            const updatedSubscriber = await this.subscriberRepository.update(id, data);
            if (!updatedSubscriber) throw new HTTPException(404, { message: "Subscriber not found" });
            return updatedSubscriber as SubscriberResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update subscriber: ${error}` });
        }
    }

    async deleteSubscriber(id: string): Promise<{ success: boolean }> {
        try {
            await this.subscriberRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete subscriber: ${error}` });
        }
    }
}
