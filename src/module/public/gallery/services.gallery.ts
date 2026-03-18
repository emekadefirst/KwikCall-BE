import { GalleryRepository } from "./repository.gallery";
import type {
    GalleryQueryParamsDTO,
    UpdateGalleryDTO,
    GalleryResponseDTO,
    GalleryPaginatedResponseDTO,
    CreateGalleryDTO
} from "./dto.gallery";
import { HTTPException } from 'hono/http-exception';

export class GalleryService {
    private galleryRepository: GalleryRepository;

    constructor() {
        this.galleryRepository = new GalleryRepository();
    }

    async createGallery(data: CreateGalleryDTO): Promise<GalleryResponseDTO> {
        try {
            const gallery = await this.galleryRepository.create(data);
            return gallery as GalleryResponseDTO;
        } catch (error) {
            console.error("Gallery Service [createGallery] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create gallery"
            });
        }
    }

    async fetchGalleries(params: GalleryQueryParamsDTO): Promise<GalleryPaginatedResponseDTO> {
        try {
            return await this.galleryRepository.fetch(params) as GalleryPaginatedResponseDTO;
        } catch (error) {
            console.error("Gallery Service [fetchGalleries] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch galleries" });
        }
    }

    async updateGallery(id: string, data: UpdateGalleryDTO): Promise<GalleryResponseDTO> {
        try {
            const updatedGallery = await this.galleryRepository.update(id, data);
            if (!updatedGallery) throw new HTTPException(404, { message: "Gallery not found" });
            return updatedGallery as GalleryResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update gallery: ${error}` });
        }
    }

    async deleteGallery(id: string): Promise<{ success: boolean }> {
        try {
            await this.galleryRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete gallery: ${error}` });
        }
    }
}
