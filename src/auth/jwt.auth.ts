import { sign, verify } from 'hono/jwt';
import { db } from '../core/db.core';
import { User } from '../module/core/user/models.user';
import { eq } from 'drizzle-orm';
import * as config from '../configs/env.configs';

type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'ES256' | 'ES384' | 'ES512' | 'EdDSA';

export class JwtService {
  private static get JWT_SECRET() { return config.JWT_SECRET_KEY(); }
    private static get JWT_REFRESH_SECRET() { return config.JWT_REFRESH_SECRET(); }
    private static get ALGORITHM() { return (config.JWT_ALGORITHM() || 'HS256') as Algorithm; }
    private static get ACCESS_EXP() { return Number(config.JWT_ACCESS_EXPIRY() || 15); }
    private static get REFRESH_EXP() { return Number(config.JWT_REFRESH_EXPIRY() || 7); }

  static async generateTokens(userId: string) {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await sign(
      {
        sub: userId,
        exp: now + (60 * this.ACCESS_EXP),
      },
      this.JWT_SECRET,
      this.ALGORITHM
    );

    const refreshToken = await sign(
      {
        sub: userId,
        exp: now + (60 * 60 * 24 * this.REFRESH_EXP),
      },
      this.JWT_REFRESH_SECRET,
      this.ALGORITHM
    );

    return { accessToken, refreshToken };
  }

  static async verifyToken(token: string, type: 'access' | 'refresh' = 'access') {
    try {
      const secret = type === 'access' ? this.JWT_SECRET : this.JWT_REFRESH_SECRET;
      return await verify(token, secret, this.ALGORITHM);
    } catch (e) {
      return null;
    }
  }

  static async getCurrentUser(token: string) {
    const payload = await this.verifyToken(token, 'access');

    if (!payload || !payload.sub) {
      return null;
    }

    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.id, payload.sub as string));

    if (!user) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Refreshes the session using a refresh token
   */
  static async refreshSession(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, 'refresh');

    if (!payload || !payload.sub) return null;

    const [user] = await db
      .select({ id: User.id })
      .from(User)
      .where(eq(User.id, payload.sub as string));

    if (!user) return null;

    return await this.generateTokens(user.id);
  }



  /**
   * Creates a short-lived signed JWT that embeds { otp, userId }.
   * The client stores this and sends it back on /verify-otp.
   * Default TTL: 10 minutes.
   */
  static async signOtpToken(
    payload: { otp: string; userId: string },
    ttlMinutes = 10
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      { ...payload, purpose: 'otp', exp: now + ttlMinutes * 60 },
      this.JWT_SECRET,
      this.ALGORITHM
    );
  }

  /**
   * Verifies an OTP token. Returns the payload or null if invalid/expired.
   */
  static async verifyOtpToken(
    token: string
  ): Promise<{ otp: string; userId: string } | null> {
    try {
      const payload = await verify(token, this.JWT_SECRET, this.ALGORITHM);
      if (payload?.purpose !== 'otp') return null;
      return payload as { otp: string; userId: string };
    } catch {
      return null;
    }
  }

  /**
   * Creates a one-time "reset privilege" token after OTP is verified.
   * Default TTL: 15 minutes.
   */
  static async signResetToken(
    userId: string,
    ttlMinutes = 15
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      { sub: userId, purpose: 'password-reset', exp: now + ttlMinutes * 60 },
      this.JWT_SECRET,
      this.ALGORITHM
    );
  }

  /**
   * Verifies a reset privilege token. Returns userId or null.
   */
  static async verifyResetToken(token: string): Promise<string | null> {
    try {
      const payload = await verify(token, this.JWT_SECRET, this.ALGORITHM);
      if (payload?.purpose !== 'password-reset' || !payload.sub) return null;
      return payload.sub as string;
    } catch {
      return null;
    }
  }

  /**
   * Creates a short-lived signed JWT that embeds email-verification data.
   * Default TTL: 10 minutes.
   */
  static async signVerifyToken(
    payload: { otp: string; userId: string; expiresAt: number },
    ttlMinutes = 10
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      { ...payload, purpose: 'email-verify', exp: now + ttlMinutes * 60 },
      this.JWT_SECRET,
      this.ALGORITHM
    );
  }

  /**
   * Verifies an email-verification token. Returns payload or null.
   */
  static async verifyVerifyToken(
    token: string
  ): Promise<{ otp: string; userId: string; expiresAt: number } | null> {
    try {
      const payload = await verify(token, this.JWT_SECRET, this.ALGORITHM);
      if (payload?.purpose !== 'email-verify') return null;
      return payload as { otp: string; userId: string; expiresAt: number };
    } catch {
      return null;
    }
  }
}
