import { pgTable, pgEnum, uuid, varchar, text, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { Category } from "../category/models.category";
import { File } from "../../core/file/models.file";

const status = pgEnum('status', ['draft', 'archive', 'published']);

export const Gallery = pgTable('galleries', {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    categoryId: uuid("category_id").references(() => Category.id, { onDelete: 'cascade' }).notNull(),
    status: status("status").notNull().default('draft'),
    description: text('description'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    createdIdx: index("gallery_created_at_idx").on(t.createdAt),
    categoryIdx: index("gallery_category_id_idx").on(t.categoryId),
}));

/* --- Many-to-Many Junction Table --- */
export const GalleryToFiles = pgTable('galleries_to_files', {
    galleryId: uuid("gallery_id")
        .notNull()
        .references(() => Gallery.id, { onDelete: 'cascade' }),
    fileId: uuid("file_id")
        .notNull()
        .references(() => File.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.galleryId, t.fileId] }),
    fileIdx: index("gallery_file_id_idx").on(t.fileId),
}));