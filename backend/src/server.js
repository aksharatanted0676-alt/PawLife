import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

async function bootstrap() {
  try {
    await connectDb();
    startReminderScheduler();
    const app = createApp();
    app.listen(env.port, () => {
      console.log(`PawLife AI backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Bootstrap failed", error);
    process.exit(1);
  }
}

bootstrap();
