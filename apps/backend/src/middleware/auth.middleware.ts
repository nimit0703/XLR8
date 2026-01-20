import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader =
        req.headers.authorization || (req.headers.Authorization as string)

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' })

        // Attach user info to request (you might need to extend Express Types for this)
        ;(req as any).user = decoded
        next()
    })
}
