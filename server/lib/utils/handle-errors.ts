import { NextFunction, Request, Response } from 'express';

export default function (fn: (fnReq: Request, fnRes: Response, fnNext: NextFunction) => unknown) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}
