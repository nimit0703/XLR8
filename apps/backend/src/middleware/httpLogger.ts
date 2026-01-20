import morgan, { StreamOptions } from 'morgan'
import { logger } from '../utils/logger'

const stream: StreamOptions = {
    // Use the 'http' log level for network requests
    write: (message) => logger.http(message.trim()),
}

export const httpLogger = morgan(
    // Format: "GET /api/users 200 - 45ms"
    ':method :url :status - :response-time ms',
    { stream }
)
