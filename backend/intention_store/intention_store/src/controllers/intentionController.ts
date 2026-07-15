/**
 * Intention controller — route handlers for the Intention Store API.
 * Handles request validation, delegates to service layer, shapes responses.
 * No business logic lives here.
 */

import { Request, Response, NextFunction } from 'express';
import { IntentionService } from '../services/IntentionService';
import {
  SaveIntentionRequest,
  SaveEveningRatingRequest,
} from '../types';
import { IntentionDomainError } from '../domain/Intention';

export class IntentionController {
  constructor(private readonly intentionService: IntentionService) {}

  /**
   * POST /api/intentions
   * Save today's intention.
   */
  saveIntention = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          errorCode: 'UNAUTHORIZED',
          message: 'User not authenticated.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        });
        return;
      }

      const body = req.body as Partial<SaveIntentionRequest>;

      // Boundary validation
      if (body.text === undefined || body.text === null) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'text is required.');
      }
      if (typeof body.text !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'text must be a string.');
      }
      if (body.date === undefined || body.date === null) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date is required.');
      }
      if (typeof body.date !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a string.');
      }

      const result = await this.intentionService.saveIntention(
        userId,
        { text: body.text, date: body.date },
        req.traceId,
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/intentions/today
   * Retrieve today's intention.
   */
  getTodaysIntention = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          errorCode: 'UNAUTHORIZED',
          message: 'User not authenticated.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        });
        return;
      }

      const date = req.query['date'] as string | undefined;

      if (!date) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date query parameter is required.');
      }
      if (typeof date !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a string.');
      }

      const result = await this.intentionService.getTodaysIntention(userId, date, req.traceId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/intentions/previous
   * Retrieve the most recent past intention.
   */
  getPreviousIntention = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          errorCode: 'UNAUTHORIZED',
          message: 'User not authenticated.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        });
        return;
      }

      const beforeDate = req.query['beforeDate'] as string | undefined;

      if (!beforeDate) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'beforeDate query parameter is required.');
      }
      if (typeof beforeDate !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'beforeDate must be a string.');
      }

      const result = await this.intentionService.getPreviousIntention(
        userId,
        beforeDate,
        req.traceId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /api/intentions/rating
   * Attach an evening rating to today's intention.
   */
  saveEveningRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          errorCode: 'UNAUTHORIZED',
          message: 'User not authenticated.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        });
        return;
      }

      const body = req.body as Partial<SaveEveningRatingRequest>;

      // Boundary validation
      if (body.date === undefined || body.date === null) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date is required.');
      }
      if (typeof body.date !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a string.');
      }
      if (body.rating === undefined || body.rating === null) {
        throw new IntentionDomainError('VALIDATION_ERROR', 'rating is required.');
      }
      if (typeof body.rating !== 'string') {
        throw new IntentionDomainError('VALIDATION_ERROR', 'rating must be a string.');
      }

      const result = await this.intentionService.saveEveningRating(
        userId,
        { date: body.date, rating: body.rating },
        req.traceId,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/intentions
   * List all intentions for the current user.
   */
  listIntentions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          errorCode: 'UNAUTHORIZED',
          message: 'User not authenticated.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        });
        return;
      }

      const result = await this.intentionService.listIntentions(userId, req.traceId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
