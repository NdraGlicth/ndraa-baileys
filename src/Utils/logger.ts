import P from 'pino'

// Logger Ndraa: level bisa diatur lewat env NDRAA_LOG_LEVEL (trace|debug|info|warn|error|silent).
// Format JSON tetap (kompatibel dengan tooling Baileys), dengan timestamp ISO dan field pkg.

export interface ILogger {
	level: string
	child(obj: Record<string, unknown>): ILogger
	trace(obj: unknown, msg?: string): void
	debug(obj: unknown, msg?: string): void
	info(obj: unknown, msg?: string): void
	warn(obj: unknown, msg?: string): void
	error(obj: unknown, msg?: string): void
}

const level = (process.env.NDRAA_LOG_LEVEL || 'info').toLowerCase()

const logger = P({
	level,
	base: { pkg: 'ndraa-baileys' },
	timestamp: P.stdTimeFunctions.isoTime
})

export default logger
