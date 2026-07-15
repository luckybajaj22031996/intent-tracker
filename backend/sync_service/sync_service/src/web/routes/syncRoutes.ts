import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ISyncService } from '../../application/SyncService';

/**
 * Wraps an async route handler so Express can catch rejected promises.
 */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * POST /sync/trigger
 *
 * Initiates a full bidirectional sync between IndexedDB and Supabase.
 * Requires a valid Supabase JWT in the Authorization header.
 *
 * Response 200: { pushed: number, pulled: number }
 * Response 401: SYNC_UNAUTHENTICATED
 * Response 503: SYNC_NETWORK_ERROR
 * Response 500: SYNC_INTERNAL_ERROR
 */
export function createSyncRouter(syncService: ISyncService): Router {
  const router = Router();

  router.post(
    '/trigger',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const traceId = (req.headers['x-trace-id'] as string | undefined) ?? uuidv4();

      // Input validation: extract and validate Authorization header
      const authHeader = req.headers['authorization'];
      const bearerPrefix = 'Bearer ';
      const userJwt =
        authHeader && authHeader.startsWith(bearerPrefix)
          ? authHeader.slice(bearerPrefix.length).trim()
          : '';

      if (!userJwt) {
        res.status(401).json({
          errorCode: 'SYNC_UNAUTHENTICATED',
          message: 'No active Supabase session exists; Sign in to sync your data.',
          timestamp: new Date().toISOString(),
          traceId,
        });
        return;
      }

      const result = await syncService.triggerSync(userJwt);
      res.status(200).json(result);
    }),
  );

  return router;
}
