import { UserRepository } from "./repository.user";
import { logger } from "../../../logger/log.logger";
import { PasswordManager } from "../../../auth/password.auth";
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

    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(data: LoginDTO) {
        try {
            const user = await this.userRepository.findUser({ email: data.email, page: 1, pageSize: 1 });
            if (!user) {
                throw new Error("User not found");
            } else{
                const passwordManager = new PasswordManager();
                if (!user[0]) {
                    throw new Error("User not found");
                }
                const isValid = await passwordManager.verify(data.password, user[0].password);
                if (!isValid) {
                    throw new Error("Invalid password");
                } else {
                    return user[0];
                }
            }
            // Here you would typically verify the password
            return user;
        } catch (error) {
            logger.error(error, "Service Error: login failed");
            throw error;
        }
    }
    async createUser(data: CreateUserDTO): Promise<void> {
        try {
            logger.info({ email: data.email }, "Service: Creating new user");

            const existing = await this.userRepository.findUser({ email: data.email, page: 1, pageSize: 1 });
            if (existing && existing.length > 0) {
                throw new Error("User with this email already exists");
            }

            const passwordManager = new PasswordManager();
            data.password = await passwordManager.hash(data.password);

            await this.userRepository.create(data);

            const subscriberService = new SubscriberService();
            await subscriberService.createSubscriber({ email: data.email });

            return; // Returns undefined/void
        } catch (error) {
            logger.error(error, "Service Error: createUser failed");
            throw error;
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