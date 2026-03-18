import { startMailConsumer } from "./core/consumer/mail.consumer";
import { startPushConsumer } from "./core/consumer/push.consumer";
import { mailProducer } from "../libs/mailer.libs";

async function bootstrap() {
    try {
        console.log("-----------------------------------------");
        console.log("🛠️  Initializing HappyFit Services...");
        console.log("-----------------------------------------");

        // 1. Start RabbitMQ Consumers
        // These run in the background to process the email and push queues

        await mailProducer.connect();
        console.log("📧 Starting Mail Consumer...");
        await startMailConsumer();

        console.log("📱 Starting Push Notification Consumer...");
        await startPushConsumer();

    } catch (error) {
        console.error("❌ Fatal error during bootstrap:", error);
        process.exit(1);
    }
}

export default bootstrap;