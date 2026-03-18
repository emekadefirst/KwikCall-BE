import { NewsRepository } from "./repository.news";
import type {
    NewsQueryParamsDTO,
    UpdateNewsDTO,
    NewsResponseDTO,
    NewsPaginatedResponseDTO,
    CreateNewsDTO
} from "./dto.news";
import { HTTPException } from 'hono/http-exception';

export class NewsService {
    private newsRepository: NewsRepository;

    constructor() {
        this.newsRepository = new NewsRepository();
    }

    async createNews(data: CreateNewsDTO): Promise<NewsResponseDTO> {
        try {
            const news = await this.newsRepository.create(data);
            return news as NewsResponseDTO;
        } catch (error) {
            console.error("News Service [createNews] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create news"
            });
        }
    }

    async fetchNews(params: NewsQueryParamsDTO): Promise<NewsPaginatedResponseDTO> {
        try {
            return await this.newsRepository.fetch(params) as NewsPaginatedResponseDTO;
        } catch (error) {
            console.error("News Service [fetchNews] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch news" });
        }
    }

    async updateNews(id: string, data: UpdateNewsDTO): Promise<NewsResponseDTO> {
        try {
            const updatedNews = await this.newsRepository.update(id, data);
            if (!updatedNews) throw new HTTPException(404, { message: "News not found" });
            return updatedNews as NewsResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update news: ${error}` });
        }
    }

    async deleteNews(id: string): Promise<{ success: boolean }> {
        try {
            await this.newsRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete news: ${error}` });
        }
    }
}
