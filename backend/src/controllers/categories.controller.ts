import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categories.service';

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(categoriesService.listCategories(req.user!.id));
  } catch (err) { next(err); }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(categoriesService.createCategory(req.user!.id, req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(categoriesService.updateCategory(req.user!.id, parseInt(req.params.id), req.body));
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    categoriesService.deleteCategory(req.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) res.status(err.statusCode).json({ error: err.message, code: err.code });
    else next(err);
  }
}
