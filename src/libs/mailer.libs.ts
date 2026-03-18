import amqp from 'amqplib';
import { RABBITMQ_URL } from '../configs/env.configs';
import { EmailSchema } from '../notification/core/mail/schemas.mail';
import { z } from '@hono/zod-openapi';

type EmailPayload = z.infer<typeof EmailSchema>;

export class MailProducer {
    private channel: amqp.Channel | null = null;
    private queueName = "email_queue";

    async connect() {
        if (this.channel) return; // Prevent re-connecting if already open

        try {
            const connection = await amqp.connect(RABBITMQ_URL || 'amqp://localhost');
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            console.log("📧 Mail Queue Producer Ready");
        } catch (error) {
            console.error("❌ RabbitMQ Connection Error:", error);
            throw error; // Throw so the app knows it failed to start
        }
    }

    async sendAuthMail(payload: EmailPayload) {
        if (!this.channel) {
            throw new Error("Mail Service Unavailable: Queue channel not initialized");
        }

        const validatedData = EmailSchema.parse(payload);
        this.channel.sendToQueue(
            this.queueName,
            Buffer.from(JSON.stringify(validatedData)),
            { persistent: true }
        );
    }

    async sendMail(payload: EmailPayload) {
        if (!this.channel) {
            throw new Error("Mail Service Unavailable: Queue channel not initialized");
        }

        const validatedData = EmailSchema.parse(payload);
        this.channel.sendToQueue(
            this.queueName,
            Buffer.from(JSON.stringify(validatedData)),
            { persistent: true }
        );
    }
}

export const mailProducer = new MailProducer();