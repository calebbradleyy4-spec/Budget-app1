import { Request, Response, NextFunction } from 'express';
import * as recurringService from '../services/recurring.service';

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(recurringService.listRecurring(req.user!.id));
  } catch (err) { next(err); }
}

export function get(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(recurringService.getRecurring(req.user!.id, parseInt(req.params.id)));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(recurringService.createRecurring(req.user!.id, req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(recurringService.updateRecurring(req.user!.id, parseInt(req.params.id), req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    recurringService.deleteRecurring(req.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}
