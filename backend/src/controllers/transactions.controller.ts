import { Request, Response, NextFunction } from 'express';
import * as txService from '../services/transactions.service';

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const opts = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      type: req.query.type as 'income' | 'expense' | undefined,
      category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
    };
    res.json(txService.listTransactions(req.user!.id, opts));
  } catch (err) { next(err); }
}

export function get(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(txService.getTransaction(req.user!.id, parseInt(req.params.id)));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(txService.createTransaction(req.user!.id, req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(txService.updateTransaction(req.user!.id, parseInt(req.params.id), req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    txService.deleteTransaction(req.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}
