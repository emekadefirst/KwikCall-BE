import { UserRepository } from "../user/repository.user";
import { PasswordManager } from "../../../auth/password.auth";
import { HTTPException } from "hono/http-exception";
import { JwtService } from "../../../auth/jwt.auth";
import type { LoginDTO, ResetPasswordDTO, RequestResetPasswordDTO } from "./dto.auth";


export class AuthService {
    private userRepository: UserRepository;
    private password: PasswordManager;


    constructor() {
        this.userRepository = new UserRepository();
        this.password = new PasswordManager()
    }

    async login(data: LoginDTO) {
        try {
            const [user] = await this.userRepository.findUser(undefined, data.email);

            if (!user || !user.password) {
                throw new HTTPException(401, { message: "Invalid email or password" });
            }

            const isValid = await this.password.verify(data.password, user.password);

            if (!isValid) {
                throw new HTTPException(401, { message: "Invalid email or password" });
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;

        } catch (error) {
            if (error instanceof HTTPException) throw error;

            throw new HTTPException(500, { message: "Internal Server Error" });
        }
    }

    // async whoami(accessToken: string) {
    //     try {
    //         const payload = await JwtService.verifyToken(accessToken, 'access');
    //         if (!payload) {
    //             throw new HTTPException(401, { message: "Unauthorized" });
    //         }

    //         const { sub } = payload as { sub: string };
    //         const result = await this.userRepository.fetch({ id: sub, page: 1, pageSize: 1 });

    //         if (!result || result.data.length === 0) {
    //             throw new HTTPException(404, { message: "Account not found" });
    //         }

    //         // Strip passwords from the results
    //         const dataWithoutPasswords = result.data.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    //         return {
    //             ...result,
    //             data: dataWithoutPasswords
    //         };

    //     } catch (error) {
    //         if (error instanceof HTTPException) throw error;
    //         throw new HTTPException(500, { message: `Unknown error: ${error}` });
    //     }
    // }

    async whoami(accessToken: string) {
        try {
            const payload = await JwtService.verifyToken(accessToken, 'access');
            if (!payload) {
                throw new HTTPException(404, { message: "Account not found" });
            }

            const { sub } = payload as { sub: string };
            const { data } = await this.userRepository.fetch({ id: sub, page: 1, pageSize: 1 });
            const user = data[0];

            if (!user) {
                throw new HTTPException(404, { message: "Account not found" });
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword; // ← return single user, not paginated wrapper

        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Unknown error: ${error}` });
        }
    }

    async refresh(refreshToken: string) {
        try {
            const tokens = await JwtService.refreshSession(refreshToken);
            if (!tokens) {
                throw new HTTPException(401, { message: "Invalid or expired refresh token" });
            }
            return tokens;
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Unknown error: ${error}` });
        }
    }
}