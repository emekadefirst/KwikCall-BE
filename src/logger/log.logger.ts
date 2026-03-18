import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Base properties included in every log entry
  base: {
    env: process.env.NODE_ENV,
    service: 'user-service', // Useful if you move to microservices later
  },
  // Formats timestamps to ISO strings (easier for log aggregators to parse)
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname', // Cleans up local dev logs
          },
        }
      : undefined,
});

// Example usage within the file for verification
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logger initialized in development mode');
}