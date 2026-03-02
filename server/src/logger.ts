/**
 * Structured logger for MoltWar API.
 *
 * Outputs JSON logs with timestamps, levels, request IDs, and context.
 * Replaces raw console.log/error calls for better observability.
 *
 * Log levels: debug < info < warn < error
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

class Logger {
  private minLevel: LogLevel;

  constructor(level?: LogLevel) {
    const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
    this.minLevel = level || (LEVEL_PRIORITY[envLevel] !== undefined ? envLevel : "info");
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  private write(level: LogLevel, msg: string, extra?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      msg,
      ...extra,
    };

    // Use structured JSON in production, readable format in dev
    if (process.env.NODE_ENV === "production") {
      const output = JSON.stringify(entry);
      if (level === "error") {
        process.stderr.write(output + "\n");
      } else {
        process.stdout.write(output + "\n");
      }
    } else {
      const prefix = `[${entry.timestamp.slice(11, 23)}] [${level.toUpperCase().padEnd(5)}]`;
      const extraStr = extra && Object.keys(extra).length > 0
        ? " " + JSON.stringify(extra)
        : "";
      const line = `${prefix} ${msg}${extraStr}`;
      if (level === "error") {
        console.error(line);
      } else if (level === "warn") {
        console.warn(line);
      } else {
        console.log(line);
      }
    }
  }

  debug(msg: string, extra?: Record<string, unknown>) {
    this.write("debug", msg, extra);
  }

  info(msg: string, extra?: Record<string, unknown>) {
    this.write("info", msg, extra);
  }

  warn(msg: string, extra?: Record<string, unknown>) {
    this.write("warn", msg, extra);
  }

  error(msg: string, extra?: Record<string, unknown>) {
    this.write("error", msg, extra);
  }

  /** Create a child logger with default extra fields */
  child(defaults: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, defaults);
  }
}

class ChildLogger {
  constructor(private parent: Logger, private defaults: Record<string, unknown>) {}

  debug(msg: string, extra?: Record<string, unknown>) {
    this.parent.debug(msg, { ...this.defaults, ...extra });
  }
  info(msg: string, extra?: Record<string, unknown>) {
    this.parent.info(msg, { ...this.defaults, ...extra });
  }
  warn(msg: string, extra?: Record<string, unknown>) {
    this.parent.warn(msg, { ...this.defaults, ...extra });
  }
  error(msg: string, extra?: Record<string, unknown>) {
    this.parent.error(msg, { ...this.defaults, ...extra });
  }
}

/** Singleton logger instance */
export const log = new Logger();

/** Generate a short request ID */
export function requestId(): string {
  return Math.random().toString(36).slice(2, 10);
}
