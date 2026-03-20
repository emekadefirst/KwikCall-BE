import bcrypt from 'bcryptjs';

export class PasswordManager {
    async hash(password: string) {
        return await bcrypt.hash(password, 10);
    }

    async verify(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }
}