import { CategoryRepository } from "./repository.category";
import type {
    CategoryQueryParamsDTO,
    UpdateCategoryDTO,
    CategoryResponseDTO,
    CategoryPaginatedResponseDTO,
    CreateCategoryDTO
} from "./dto.category";
import { HTTPException } from 'hono/http-exception';

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async createCategory(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {
        try {
            const category = await this.categoryRepository.create(data);
            return category as CategoryResponseDTO;
        } catch (error) {
            console.error("Category Service [createCategory] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create category"
            });
        }
    }

    async fetchCategories(params: CategoryQueryParamsDTO): Promise<CategoryPaginatedResponseDTO> {
        try {
            return await this.categoryRepository.fetch(params) as CategoryPaginatedResponseDTO;
        } catch (error) {
            console.error("Category Service [fetchCategories] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch categories" });
        }
    }

    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
        try {
            const updatedCategory = await this.categoryRepository.update(id, data);
            if (!updatedCategory) throw new HTTPException(404, { message: "Category not found" });
            return updatedCategory as CategoryResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update category: ${error}` });
        }
    }

    async deleteCategory(id: string): Promise<{ success: boolean }> {
        try {
            await this.categoryRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete category: ${error}` });
        }
    }
}
