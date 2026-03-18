import amqplib from 'amqplib';
import { RABBITMQ_URL } from "../../../configs/env.configs";
import { sendMulticastNotification } from "../push/core.push";
import type { NotificationPayload } from "../push/types.push";

export async function startPushConsumer() {
    if (!RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is not defined in the environment variables.");
    }

    try {
        const connection = await amqplib.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'push_notification_queue';
        await channel.assertQueue(queue, { durable: true });

        console.log(`[*] Push Notification Consumer started. Listening on ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const payload: NotificationPayload = JSON.parse(content);
                    await sendMulticastNotification(payload);
                    channel.ack(msg);
                } catch (error) {
                    console.error("[Push Consumer] Error processing message:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("Failed to connect to RabbitMQ for Push Consumer:", error);
    }
}