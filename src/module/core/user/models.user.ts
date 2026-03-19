import { pgTable, pgEnum, pgSchema, uuid, varchar, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);

export const publicSchema = pgSchema("public");

export const User = publicSchema.table("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 128 }),
    role: userRole("role").notNull().default("user"),
    password: varchar("password", { length: 128 }),
    isActive: boolean("is_active").default(true),
    isVerified: boolean("is_verified").default(false),
    lastLogin: timestamp("last_login"),
    deviceTokens: jsonb("device_tokens").default("[]"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        emailIndex: index("idx_users_email").on(table.email),
        firstNameIndex: index("idx_users_first_name").on(table.firstName),
        lastNameIndex: index("idx_users_last_name").on(table.lastName),
    };
});

