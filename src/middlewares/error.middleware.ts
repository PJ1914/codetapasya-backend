import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global error handler middleware
 * Should be registered as the LAST middleware in the app
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: isDevelopment ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { details: err.details, stack: err.stack }),
  });
};

/**
 * Async error wrapper for route handlers
 * Wraps async functions and catches errors automatically
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Custom error class for API errors
 */
export class ApplicationError extends Error implements ApiError {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApplicationError';
  }
}

// Common error constructors
export const BadRequestError = (message: string, details?: any) =>
  new ApplicationError(message, 400, details);

export const UnauthorizedError = (message: string, details?: any) =>
  new ApplicationError(message, 401, details);

export const ForbiddenError = (message: string, details?: any) =>
  new ApplicationError(message, 403, details);

export const NotFoundError = (message: string, details?: any) =>
  new ApplicationError(message, 404, details);

export const ConflictError = (message: string, details?: any) =>
  new ApplicationError(message, 409, details);

export const PaymentRequiredError = (message: string, details?: any) =>
  new ApplicationError(message, 402, details);
