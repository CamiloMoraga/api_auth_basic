import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
        const response = await UserService.deleteUser(req.params.id);
        res.status(response.code).json(response.message);
    });

// Endpoint para obtener todos los usuarios activos
router.get('/getAllUsers', AuthMiddleware.validateToken, async (req, res) => {
    const response = await UserService.getAllActiveUsers();
    res.status(response.code).json(response.message);
});

// Endpoint para buscar usuarios con filtros
router.get('/findUsers', AuthMiddleware.validateToken, async (req, res) => {
    const filters = {
        deleted: req.query.deleted,
        name: req.query.name,
        loginBefore: req.query.loginBefore,
        loginAfter: req.query.loginAfter,
    };
    const response = await UserService.findUsers(filters);
    res.status(response.code).json(response.message);
});

// Endpoint para crear usuarios en masa
router.post('/bulkCreate', AuthMiddleware.validateToken, async (req, res) => {
    const response = await UserService.bulkCreateUsers(req.body.users);
    res.status(response.code).json(response.message);
});



export default router;