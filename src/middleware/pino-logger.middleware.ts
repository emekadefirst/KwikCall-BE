import type { Context, Next } from 'hono';
import { logger } from '../logger/log.logger';

export const pinoLogger = async (c: Context, next: Next) => {
  const { method, path } = c.req;
  const start = performance.now();

  await next();

  const responseTime = (performance.now() - start).toFixed(2);
  const status = c.res.status;

  const logData = {
    method,
    path,
    status,
    responseTime: `${responseTime}ms`,
  };

  if (status >= 500) {
    logger.error(logData, 'Request Failed');
  } else if (status >= 400) {
    logger.warn(logData, 'Client Error');
  } else {
    logger.info(logData, 'Request Finished');
  }
};