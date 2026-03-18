import amqplib from 'amqplib';
import { RABBITMQ_URL } from "../../../configs/env.configs";
import { sendMail } from "../mail/core.mail";
import { EmailSchema } from "../mail/schemas.mail"; // Added for runtime safety
import type { EmailPayload } from "../mail/types.mail";

export async function startMailConsumer() {
    try {
        if (!RABBITMQ_URL) {
            throw new Error("RABBITMQ_URL is not defined in your environment variables.");
        }

        const connection = await amqplib.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'email_queue';
        await channel.assertQueue(queue, { durable: true });

        // 1. Important: Only take one message at a time to prevent 
        // flooding your SMTP connection or being flagged as spam.
        channel.prefetch(1);

        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const rawPayload = JSON.parse(content);

                    // 2. Runtime validation: ensures data shape matches EmailPayload
                    const validatedPayload = EmailSchema.parse(rawPayload);

                    console.log(`📨 Sending email to: ${validatedPayload.to.join(', ')}`);
                    await sendMail(validatedPayload);

                    channel.ack(msg);
                } catch (error) {
                    console.error("❌ Error processing email task:", error);

                    // nack with false, false means "Don't requeue" 
                    // This prevents a "Poison Message" from looping forever
                    channel.nack(msg, false, false);
                }
            }
        });

        // 3. Keep-alive: If connection drops, the process should know
        connection.on("close", () => {
            console.error("RabbitMQ connection lost. Worker might need restart.");
        });

    } catch (error) {
        console.error("Failed to connect to RabbitMQ for Mail Consumer:", error);
    }
}