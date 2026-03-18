

export class PasswordManager {
    async hash(password: string) {
        return await Bun.password.hash(password);
    }

    async verify(password: string, hash: string) {
        return await Bun.password.verify(password, hash);
    }
}

