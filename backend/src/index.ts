import { config } from './config';
import { runMigrations } from './db/migrate';
import { seedDefaultCategories } from './db/seed';
import { startRecurringJob } from './jobs/recurringJob';
import app from './app';

async function main() {
  try {
    runMigrations();
    seedDefaultCategories();
    startRecurringJob();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
