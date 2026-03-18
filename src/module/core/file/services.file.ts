import { FileRepository } from "./repository.file";
import type { 
    FileQueryParamsDTO, 
    UpdateFileDTO, 
    FileTypeEnumDTO, 
    FileResponseDTO, 
    FilePaginatedResponseDTO,
    CreateFileDTO 
} from "./dto.file";
import { HTTPException } from 'hono/http-exception';
import { uploadFile, type UploadInput } from "../../../libs/cloudinary.libs";

export class FileService {
    private fileRepository: FileRepository;

    constructor() {
        this.fileRepository = new FileRepository();
    }

    async createFile(input: UploadInput) {
        try {
            const uploaded = await uploadFile(
                input,
                process.env.CLOUDINARY_CLOUD_NAME || "",
                process.env.CLOUDINARY_API_KEY || "",
                process.env.CLOUDINARY_API_SECRET || ""
            );
            const typeMapping: Record<string, FileTypeEnumDTO> = {
                raw: 'document',
                image: 'image',
                video: 'video',
                audio: 'audio'
            };

            const fileData: CreateFileDTO = {
                url: uploaded.url,
                size: uploaded.size,
                type: typeMapping[uploaded.type] || 'document',
            };

            const savedFile = await this.fileRepository.create(fileData);

            return savedFile;

        } catch (error) {
            console.error("File Service [createFile] Error:", error);
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, {
                message: error instanceof Error ? error.message : "Failed to process file"
            });
        }
    }

    async fetchFiles(params: FileQueryParamsDTO): Promise<FilePaginatedResponseDTO> {
        try {
            return await this.fileRepository.fetch(params) as FilePaginatedResponseDTO;
        } catch (error) {
            console.error("File Service [fetchFiles] Error:", error);
            throw new HTTPException(500, { message: "Failed to fetch files" });
        }
    }

    async updateFile(id: string, data: UpdateFileDTO): Promise<FileResponseDTO> {
        try {
            const updatedFile = await this.fileRepository.update(id, data);
            if (!updatedFile) throw new HTTPException(404, { message: "File not found" });
            return updatedFile as FileResponseDTO;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to update file: ${error}` });
        }
    }

    async deleteFile(id: string): Promise<{ success: boolean }> {
        try {
            // Note: You might want to delete from Cloudinary here too eventually!
            await this.fileRepository.delete(id);
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: `Failed to delete file: ${error}` });
        }
    }
}