import { Request, Response, NextFunction } from 'express';
import * as reportsService from '../services/reports.service';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function spendingByCategory(req: Request, res: Response, next: NextFunction): void {
  try {
    const month = (req.query.month as string) || currentMonth();
    res.json(reportsService.getSpendingByCategory(req.user!.id, month));
  } catch (err) { next(err); }
}

export function monthlyTrend(req: Request, res: Response, next: NextFunction): void {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 6;
    res.json(reportsService.getMonthlyTrend(req.user!.id, months));
  } catch (err) { next(err); }
}

export function summary(req: Request, res: Response, next: NextFunction): void {
  try {
    const month = (req.query.month as string) || currentMonth();
    res.json(reportsService.getMonthlySummary(req.user!.id, month));
  } catch (err) { next(err); }
}
