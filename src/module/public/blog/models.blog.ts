import { pgTable, pgEnum, uuid, varchar, text, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { Category } from "../category/models.category";
import { File } from "../../core/file/models.file";

export const status = pgEnum('status', ['draft', 'archive', 'published']);

export const Blog = pgTable('blogs', {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    categoryId: uuid("category_id").references(() => Category.id, { onDelete: 'cascade' }).notNull(),
    status: status("status").notNull().default('draft'),
    content: text('content'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    createdIdx: index("blog_created_at_idx").on(t.createdAt),
    categoryIdx: index("blog_category_id_idx").on(t.categoryId),
}));

/* --- Many-to-Many Junction Table --- */
export const BlogsToFiles = pgTable('blogs_to_files', {
    blogId: uuid("blog_id")
        .notNull()
        .references(() => Blog.id, { onDelete: 'cascade' }),
    fileId: uuid("file_id")
        .notNull()
        .references(() => File.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.blogId, t.fileId] }),
    fileIdx: index("blog_file_id_idx").on(t.fileId),
}));