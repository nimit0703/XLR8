import { Router } from 'express';
import { userController } from './user.controller';
import { verifyJWT } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT)
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

export default router;