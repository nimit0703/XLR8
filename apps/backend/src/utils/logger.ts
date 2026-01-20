import winston from 'winston'
import 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize, align } = winston.format

// Custom Format for Console (Development)
// Output: [2025-01-20 10:00:00] [INFO]: Message here
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`
})

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

    // Define log levels
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },

    transports: [
        // 1. Console Transport (Visuals for you)
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                align(),
                logFormat
            ),
        }),

        // 2. Error File Transport (Only logs errors)
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d', // Keep logs for 14 days
            zippedArchive: true,
        }),

        // 3. Combined File Transport (Logs everything)
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
    ],
})
