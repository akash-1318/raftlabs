import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  const message = err instanceof Error ? err.message : 'Unknown error';
  return res.status(500).json({ error: 'INTERNAL_ERROR', message });
}
