import { FaqRepository } from "./repository.faq";
import type {
    FaqQueryParamsDTO,
    UpdateFaqDTO,
    FaqResponseDTO,
    FaqPaginatedResponseDTO,
    CreateFaqDTO
} from "./dto.faq";
import { HTTPException } from 'hono/http-exception';

export class FaqService {
    private faqRepository: FaqRepository;

    constructor() {
        this.faqRepository = new FaqRepository();
    }

    async createFaq(data: CreateFaqDTO): Promise<FaqResponseDTO> {
        try {
            const faq = await this.faqRepository.create(data);
            return faq as FaqResponseDTO;
        } catch (error) {
            console.error("Faq Service [createFaq] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create faq"
            });
        }
    }

    async fetchFaqs(params: FaqQueryParamsDTO): Promise<FaqPaginatedResponseDTO> {
        try {
            return await this.faqRepository.fetch(params) as FaqPaginatedResponseDTO;
        } catch (error) {
            console.error("Faq Service [fetchFaqs] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch faqs" });
        }
    }

    async updateFaq(id: string, data: UpdateFaqDTO): Promise<FaqResponseDTO> {
        try {
            const updatedFaq = await this.faqRepository.update(id, data);
            if (!updatedFaq) throw new HTTPException(404, { message: "Faq not found" });
            return updatedFaq as FaqResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update faq: ${error}` });
        }
    }

    async deleteFaq(id: string): Promise<{ success: boolean }> {
        try {
            await this.faqRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete faq: ${error}` });
        }
    }
}
