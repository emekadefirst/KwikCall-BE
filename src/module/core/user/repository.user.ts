import { db } from "../../../core/db.core";
import { User } from "./models.user";
import { eq, and, ilike, or, count } from "drizzle-orm";
import type { UserQueryParamsDTO, CreateUserDTO, UpdateUserDTO } from "./dto.user";



export class UserRepository {
    async create(data: CreateUserDTO) {
        try {
            const [user] = await db.insert(User).values(data).returning();
            if (!user) throw new Error("Failed to create user");
            return null; // Return the user, not null
        } catch (error) {
            console.error(`Database Error: ${error}`);
            throw error;
        }
    }

    // internal query
    async findUser(id?: string, email?: string, phoneNumber?: string) { 
        try {

            const filters = [];
            if (id) filters.push(eq(User.id, id));
            if (phoneNumber !== undefined) filters.push(eq(User.phoneNumber, phoneNumber));
            if (email) filters.push(eq(User.email, email));

            const whereClause = filters.length > 0 ? and(...filters) : undefined;

            const user = await db.select()
                .from(User)
                .where(whereClause)
            return user;
        } catch (error) {
            console.error(`Database Error:`, error); // console.error is better for errors
            throw new Error("Failed to fetch users. Check server logs.");
        }
    }

    async fetch(params: UserQueryParamsDTO) {
        const { id, role, search, page = 1, pageSize = 10, isActive, isVerified } = params;
        const offset = (page - 1) * pageSize;

        const filters = [];
        if (id) filters.push(eq(User.id, id));
        if (role) filters.push(eq(User.role, role));
        if (isActive !== undefined) filters.push(eq(User.isActive, isActive));
        if (isVerified !== undefined) filters.push(eq(User.isVerified, isVerified));

        // Note: ilike usually takes two arguments. If searching multiple columns, 
        // you likely need or() logic.
        if (search) {
            filters.push(or(
                ilike(User.firstName, `%${search}%`),
                ilike(User.lastName, `%${search}%`),
                ilike(User.email, `%${search}%`),
                ilike(User.phoneNumber, `%${search}%`),
                ilike(User.role, `%${search}%`)
            ));
        }

        const whereClause = and(...filters);

        // Run both queries in parallel to save time
        const [data, totalCount] = await Promise.all([
            db.select().from(User).where(whereClause).limit(pageSize).offset(offset),
            db.select({ count: count() }).from(User).where(whereClause)
        ]);

        return {
            page,
            pageSize,
            total: Number(totalCount[0]?.count || 0),
            data
        };
    }

    async update(id: string, data: UpdateUserDTO) {
        try {
            const [user] = await db.update(User).set(data).where(eq(User.id, id)).returning();
            if (!user) {
                throw new Error("Failed to update user");
            } else {
                return user;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }

    async delete(id: string) {
        try {
            const [user] = await db.delete(User).where(eq(User.id, id)).returning();
            if (!user) {
                throw new Error("Failed to delete user");
            } else {
                return user;
            }
        } catch (error) {
            console.log(`Unknown error: ${error}`);
            throw new Error("Unknown error check your log");
        }
    }
}