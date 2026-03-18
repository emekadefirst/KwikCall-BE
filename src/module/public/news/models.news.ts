import { pgTable, pgEnum, uuid, varchar, text, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { Category } from "../category/models.category";
import { File } from "../../core/file/models.file";

const status = pgEnum('status', ['draft', 'archive', 'published']);

export const News = pgTable('news', {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    categoryId: uuid("category_id").references(() => Category.id, { onDelete: 'cascade' }).notNull(),
    status: status("status").notNull().default('draft'),
    content: text('content'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    createdIdx: index("news_created_at_idx").on(t.createdAt),
    categoryIdx: index("news_category_id_idx").on(t.categoryId),
}));

/* --- Many-to-Many Junction Table --- */
export const NewsToFiles = pgTable('news_to_files', {
    newsId: uuid("news_id")
        .notNull()
        .references(() => News.id, { onDelete: 'cascade' }),
    fileId: uuid("file_id")
        .notNull()
        .references(() => File.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.newsId, t.fileId] }),
    fileIdx: index("news_file_id_idx").on(t.fileId),
}));