/// A function to get userId from header
import { HTTPException } from "hono/http-exception";
import { JwtService } from "../auth/jwt.auth";

export async function getUserIdFromHeader(accessToken: string): Promise<string> {
    try {
        const user = await JwtService.getCurrentUser(accessToken);
        if (!user) {
            throw new HTTPException(404, { message: "User not found" });
        }
        return user.id;
    } catch (error) {
        throw new HTTPException(401, { message: "Invalid token" });
    }
}
