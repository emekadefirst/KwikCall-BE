import { UserRepository } from "./repository.user";
import { logger } from "../../../logger/log.logger";
import { PasswordManager } from "../../../auth/password.auth";
import { HTTPException } from "hono/http-exception";
import type {
    UserQueryParamsDTO,
    CreateUserDTO,
    UpdateUserDTO,
    UserPaginatedResponseDTO,
    UserResponseDTO,
    LoginDTO
} from "./dto.user";
import { SubscriberService } from "../../public/subscriber/services.subscriber";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export class UserService {
    private userRepository: UserRepository;
    private password: PasswordManager;


    constructor() {
        this.userRepository = new UserRepository();
        this.password = new PasswordManager()
    }

    async createUser(data: CreateUserDTO): Promise<void> {
        try {
            logger.info({ email: data.email }, "Service: Creating new user");

            // 1. VALIDATION: This check "narrows" the type. 
            // After this block, TypeScript knows data.password MUST be a string.
            if (!data.password) {
                throw new HTTPException(400, { message: "Password is required" });
            }

            // 2. Check for existing user (findUser returns an array)
            const [existing] = await this.userRepository.findUser(undefined, data.email);
            if (existing) {
                throw new HTTPException(409, { message: "User with this email already exists" });
            }

            // 3. Hash the password (TypeScript error is now gone)
            const hashedPassword = await this.password.hash(data.password);

            // 4. Create the user object
            const userData = {
                ...data,
                password: hashedPassword,
            };

            await this.userRepository.create(userData);

            // 5. Side effects
            const subscriberService = new SubscriberService();
            await subscriberService.createSubscriber({ email: data.email });

            return;
        } catch (error) {
            // Rethrow HTTPErrors so Hono catches the specific status code (400, 409, etc)
            if (error instanceof HTTPException) {
                throw error;
            }

            logger.error(error, "Service Error: createUser failed");
            // Wrap unexpected errors in a 500
            throw new HTTPException(500, { message: "Internal Server Error" });
        }
    }

    async getAllUsers(params: UserQueryParamsDTO): Promise<UserPaginatedResponseDTO> {
        try {
            logger.info(params, "Service: Fetching paginated users");
            const result = await this.userRepository.fetch(params);
            return {
                ...result,
                data: result.data.map((user: any) => {

                    const { password, ...rest } = user;
                    return {
                        ...rest,
                        phoneNumbers: user.phoneNumbers as Json,
                        deviceTokens: user.deviceTokens as Json,
                    };
                }),
            };
        } catch (error) {
            logger.error(error, "Service Error: getAllUsers failed");
            throw error;
        }
    }


    /**
     * Updates user details
     */
    async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
        try {
            const updatedUser = await this.userRepository.update(id, data);
            return updatedUser as UserResponseDTO;
        } catch (error) {
            logger.error({ userId: id, error }, "Service Error: updateUser failed");
            throw error;
        }
    }

    /**
     * Deletes a user
     */
    async deleteUser(id: string): Promise<{ success: boolean }> {
        try {
            await this.userRepository.delete(id);
            return { success: true };
        } catch (error) {
            logger.error({ userId: id }, "Service Error: deleteUser failed");
            throw error;
        }
    }
}