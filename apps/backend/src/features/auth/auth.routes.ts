import { Router } from 'express'
import { authController } from './auth.controller'

const router = Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/refresh', authController.refresh) // Client calls this when 401 occurs
router.post('/logout', authController.logout)

export default router
