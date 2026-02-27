import cron from 'node-cron';
import { processRecurringRules } from '../services/recurring.service';

export function startRecurringJob(): void {
  // Run every day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('[RecurringJob] Processing recurring rules...');
    try {
      processRecurringRules();
      console.log('[RecurringJob] Done.');
    } catch (err) {
      console.error('[RecurringJob] Error:', err);
    }
  });

  // Also run on startup to catch any missed days
  try {
    processRecurringRules();
  } catch (err) {
    console.error('[RecurringJob] Startup run error:', err);
  }
}
