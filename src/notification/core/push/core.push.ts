import { FIREBASE_SECRET_PATH } from '../../../configs/env.configs';
import admin from 'firebase-admin';
import { NotificationSchema } from "./schemas.push";
import type { NotificationPayload } from "./types.push";

let messaging: admin.messaging.Messaging | null = null;

function initializeFirebase() {
    if (messaging) return messaging;

    try {
        // FORCE HTTP/1.1 to bypass Bun/Windows HTTP2 issues
        process.env.GOOGLE_CLOUD_USE_HTTP2 = 'false';

        if (!admin.apps?.length) {
            admin.initializeApp({
                credential: admin.credential.cert(FIREBASE_SECRET_PATH),
            });
        }
        messaging = admin.messaging();
        return messaging;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
}

export async function sendMulticastNotification(payload: NotificationPayload) {
    try {
        const msgs = initializeFirebase();
        const validated = NotificationSchema.parse(payload);

        const message: admin.messaging.MulticastMessage = {
            tokens: validated.tokens,
            notification: {
                title: validated.title,
                body: validated.body
            },
            data: validated.data,
            android: {
                priority: 'high'
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        sound: 'default'
                    }
                }
            }
        };

        const response = await msgs.sendEachForMulticast(message);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const token = validated.tokens[idx];
                    if (token) {
                        failedTokens.push(token);
                    }
                }
            });
            console.log('List of tokens that caused failures:', failedTokens);
        }

        return response;

    } catch (error) {
        console.error('[Push Service] Error details:', error);
        throw error;
    }
}