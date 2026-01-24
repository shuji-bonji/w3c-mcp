/**
 * Logger utility for W3C MCP Server
 * Provides debug logging controlled by environment variable
 */

const DEBUG = process.env.W3C_MCP_DEBUG === 'true';
const LOG_PERFORMANCE = process.env.W3C_MCP_PERF === 'true' || DEBUG;

/**
 * Log debug message (only when W3C_MCP_DEBUG=true)
 */
export function debug(message: string, data?: unknown): void {
	if (DEBUG) {
		const timestamp = new Date().toISOString();
		if (data !== undefined) {
			console.error(`[${timestamp}] [DEBUG] ${message}`, JSON.stringify(data, null, 2));
		} else {
			console.error(`[${timestamp}] [DEBUG] ${message}`);
		}
	}
}

/**
 * Log info message (always shown)
 */
export function info(message: string): void {
	console.error(`[INFO] ${message}`);
}

/**
 * Log warning message (always shown)
 */
export function warn(message: string, error?: Error): void {
	if (error) {
		console.error(`[WARN] ${message}:`, error.message);
	} else {
		console.error(`[WARN] ${message}`);
	}
}

/**
 * Log error message (always shown)
 */
export function error(message: string, err?: Error): void {
	if (err) {
		console.error(`[ERROR] ${message}:`, err.message);
		if (DEBUG && err.stack) {
			console.error(err.stack);
		}
	} else {
		console.error(`[ERROR] ${message}`);
	}
}

/**
 * Performance measurement utilities
 */
export class PerformanceTimer {
	private startTime: number;
	private label: string;

	constructor(label: string) {
		this.label = label;
		this.startTime = Date.now();

		if (LOG_PERFORMANCE) {
			debug(`${label} started`);
		}
	}

	/**
	 * End the timer and log the duration
	 */
	end(): number {
		const duration = Date.now() - this.startTime;

		if (LOG_PERFORMANCE) {
			console.error(`[PERF] ${this.label}: ${duration}ms`);
		}

		return duration;
	}

	/**
	 * Log an intermediate checkpoint
	 */
	checkpoint(name: string): number {
		const duration = Date.now() - this.startTime;

		if (LOG_PERFORMANCE) {
			console.error(`[PERF] ${this.label} → ${name}: ${duration}ms`);
		}

		return duration;
	}
}

/**
 * Decorator-style performance logging
 */
export function logPerformance<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
	if (!LOG_PERFORMANCE) {
		return fn();
	}

	const timer = new PerformanceTimer(label);
	const result = fn();

	if (result instanceof Promise) {
		return result.finally(() => timer.end());
	}

	timer.end();
	return result;
}

/**
 * Log tool invocation (for debugging)
 */
export function logToolCall(toolName: string, args: unknown): void {
	debug(`Tool called: ${toolName}`, args);
}

/**
 * Log tool result (for debugging)
 */
export function logToolResult(toolName: string, resultSize: number): void {
	debug(`Tool result: ${toolName}`, { resultSize });
}
