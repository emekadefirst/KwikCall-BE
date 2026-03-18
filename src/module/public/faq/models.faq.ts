import { pgTable, pgEnum, uuid, varchar, text, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { Category } from "../category/models.category";

const status = pgEnum('status', ['draft', 'archive', 'published']);

export const Faq = pgTable('faqs', {
    id: uuid("id").primaryKey().defaultRandom(),
    question: varchar("question", { length: 255 }).notNull().unique(),
    categoryId: uuid("category_id").references(() => Category.id, { onDelete: 'cascade' }).notNull(),
    status: status("status").notNull().default('draft'),
    answer: text('answer'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    createdIdx: index("faq_created_at_idx").on(t.createdAt),
    categoryIdx: index("faq_category_id_idx").on(t.categoryId),
}));
