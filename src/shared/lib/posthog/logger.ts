import { SeverityNumber } from '@opentelemetry/api-logs';
import { after } from 'next/server';
import { loggerProvider } from '~/instrumentation';

const otelLogger = loggerProvider.getLogger('nnshop');

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogAttributes = Record<string, string | number | boolean | undefined>;

const SEVERITY: Record<LogLevel, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
};

function emit(level: LogLevel, message: string, attributes?: LogAttributes) {
  otelLogger.emit({
    body: message,
    severityNumber: SEVERITY[level],
    attributes,
  });

  after(async () => {
    await loggerProvider.forceFlush();
  });
}

export const logger = {
  debug: (message: string, attributes?: LogAttributes) => emit('debug', message, attributes),
  info: (message: string, attributes?: LogAttributes) => emit('info', message, attributes),
  warn: (message: string, attributes?: LogAttributes) => emit('warn', message, attributes),
  error: (message: string, attributes?: LogAttributes) => emit('error', message, attributes),
};
