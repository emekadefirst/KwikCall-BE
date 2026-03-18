import amqp from 'amqplib';
import { RABBITMQ_URL } from '../configs/env.configs';
import { NotificationSchema } from '../notification/core/push/schemas.push';
import { z } from '@hono/zod-openapi';

type NotificationPayload = z.infer<typeof NotificationSchema>;

export class PushProducer {
    private channel: amqp.Channel | null = null;
    private queueName = "push_notification_queue";

    async connect() {
        if (this.channel) return;

        try {
            const connection = await amqp.connect(RABBITMQ_URL || 'amqp://localhost');
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            console.log("🔔 Push Queue Producer Ready");
        } catch (error) {
            console.error("❌ RabbitMQ Push Connection Error:", error);
            throw error;
        }
    }

    async sendPushNotification(payload: NotificationPayload) {
        if (!this.channel) {
            throw new Error("Push Service Unavailable: Queue channel not initialized");
        }

        const validatedData = NotificationSchema.parse(payload);
        this.channel.sendToQueue(
            this.queueName,
            Buffer.from(JSON.stringify(validatedData)),
            { persistent: true }
        );
    }
}

export const pushProducer = new PushProducer();
