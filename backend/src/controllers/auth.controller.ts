import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export function register(req: Request, res: Response, next: NextFunction): void {
  try {
    const result = authService.register(req.body.email, req.body.password, req.body.name);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message, code: err.code });
    } else {
      next(err);
    }
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  try {
    const result = authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message, code: err.code });
    } else {
      next(err);
    }
  }
}

export function refresh(req: Request, res: Response, next: NextFunction): void {
  try {
    const result = authService.refreshTokens(req.body.refreshToken);
    res.json(result);
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message, code: err.code });
    } else {
      next(err);
    }
  }
}

export function logout(req: Request, res: Response, next: NextFunction): void {
  try {
    authService.logout(req.body.refreshToken);
    res.status(204).send();
  } catch (err: any) {
    next(err);
  }
}

export function me(req: Request, res: Response): void {
  res.json(req.user);
}
