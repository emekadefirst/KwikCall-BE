import { UserRepository } from "../user/repository.user";
import { PasswordManager } from "../../../auth/password.auth";
import { HTTPException } from "hono/http-exception";
import { JwtService } from "../../../auth/jwt.auth";
import type { LoginDTO, ResetPasswordDTO,RequestResetPasswordDTO } from "./dto.auth";


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

    async whoami(accessToken: string) {
        try {
            const user = await JwtService.  getCurrentUser(accessToken);
            if (!user) {
                throw new  HTTPException(404, { message: "Account not found" });
            }
            return user;
        } catch (error) {
            throw new  HTTPException(500, { message: `Unknow error:  ${error}` });
        }
    }

    async refresh(refreshToken: string) {
        try {
            const user = await JwtService.refreshSession(refreshToken);
            if (!user) {
                throw new  HTTPException(404, { message: "Account not found" });
            }
            return user;
        } catch (error) {
            throw new  HTTPException(500, { message: `Unknow error:  ${error}` });
        }
    }
}