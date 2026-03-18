import { BlogRepository } from "./repository.blog";
import type {
    BlogQueryParamsDTO,
    UpdateBlogDTO,
    BlogResponseDTO,
    BlogPaginatedResponseDTO,
    CreateBlogDTO
} from "./dto.blog";
import { HTTPException } from 'hono/http-exception';

export class BlogService {
    private blogRepository: BlogRepository;

    constructor() {
        this.blogRepository = new BlogRepository();
    }

    async createBlog(data: CreateBlogDTO): Promise<BlogResponseDTO> {
        try {
            const blog = await this.blogRepository.create(data);
            return blog as BlogResponseDTO;
        } catch (error) {
            console.error("Blog Service [createBlog] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to create blog"
            });
        }
    }

    async fetchBlogs(params: BlogQueryParamsDTO): Promise<BlogPaginatedResponseDTO> {
        try {
            return await this.blogRepository.fetch(params) as BlogPaginatedResponseDTO;
        } catch (error) {
            console.error("Blog Service [fetchBlogs] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch blogs" });
        }
    }

    async updateBlog(id: string, data: UpdateBlogDTO): Promise<BlogResponseDTO> {
        try {
            const updatedBlog = await this.blogRepository.update(id, data);
            if (!updatedBlog) throw new HTTPException(404, { message: "Blog not found" });
            return updatedBlog as BlogResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update blog: ${error}` });
        }
    }

    async deleteBlog(id: string): Promise<{ success: boolean }> {
        try {
            await this.blogRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete blog: ${error}` });
        }
    }
}
