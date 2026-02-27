import { Request, Response, NextFunction } from 'express';
import * as budgetsService from '../services/budgets.service';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const month = (req.query.month as string) || currentMonth();
    res.json(budgetsService.listBudgets(req.user!.id, month));
  } catch (err) { next(err); }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(budgetsService.createBudget(req.user!.id, req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(budgetsService.updateBudget(req.user!.id, parseInt(req.params.id), req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    budgetsService.deleteBudget(req.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}
