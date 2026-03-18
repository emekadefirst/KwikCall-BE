import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { FileService } from "./services.file";
import { 
    createFileSchema, 
    updateFileSchema, 
    FileQueryParamSchema
} from "./schemas.file"; // Ensure these are Zod schemas
import { HTTPException } from "hono/http-exception";

const fileService = new FileService();
const fileController = new OpenAPIHono();

/* --- 1. Upload File Route --- */
const uploadRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        file: z.instanceof(File).openapi({ type: 'string', format: 'binary' }),
                    }),
                },
            },
        },
    },
    responses: {
        201: { description: 'File uploaded and saved successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['Files'],
});

fileController.openapi(uploadRoute, async (c) => {
    const body = await c.req.parseBody();
    const fileItem = body['file'];

    if (!(fileItem instanceof File)) {
        throw new HTTPException(400, { message: "No file provided" });
    }

    // Convert Web File to Buffer for your Service/Cloudinary logic
    const arrayBuffer = await fileItem.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await fileService.createFile({
        buffer,
        originalName: fileItem.name,
        mimeType: fileItem.type,
    });

    return c.json(result, 201);
});

/* --- 2. Fetch Files Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: FileQueryParamSchema, // Assuming this is your Zod schema for pagination/filtering
    },
    responses: {
        200: { description: 'List of files' },
    },
    tags: ['Files'],
});

fileController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await fileService.fetchFiles(query);
    return c.json(result, 200);
});

/* --- 3. Update File Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateFileSchema } }
        }
    },
    responses: {
        200: { description: 'File updated successfully' },
        404: { description: 'File not found' },
    },
    tags: ['Files'],
});

fileController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await fileService.updateFile(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete File Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'File deleted successfully' },
    },
    tags: ['Files'],
});

fileController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await fileService.deleteFile(id);
    return c.json(result, 200);
});

export default fileController;