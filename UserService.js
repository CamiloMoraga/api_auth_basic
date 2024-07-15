import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

// Función para eliminar un usuario (soft delete)
const deleteUser = async (id) => {
    await db.User.update({ status: false }, { where: { id: id, status: true } });
    return { code: 200, message: 'User deleted successfully' };
}

// Función para obtener todos los usuarios activos
const getAllActiveUsers = async () => {
    const users = await db.User.findAll({ where: { status: true } });
    return { code: 200, message: users };
}

// Función para buscar usuarios con filtros
const findUsers = async (filters) => {
    const query = { where: {} };
    if (filters.deleted !== undefined) {
        query.where.status = filters.deleted === 'true' ? false : true;
    }
    if (filters.name) {
        query.where.name = { [db.Sequelize.Op.like]: `%${filters.name}%` };
    }
    if (filters.loginBefore) {
        query.where.lastLogin = { [db.Sequelize.Op.lt]: new Date(filters.loginBefore) };
    }
    if (filters.loginAfter) {
        query.where.lastLogin = { [db.Sequelize.Op.gt]: new Date(filters.loginAfter) };
    }
    const users = await db.User.findAll(query);
    return { code: 200, message: users };
}

// Función para crear usuarios en masa
const bulkCreateUsers = async (users) => {
    const createdUsers = [];
    const failedUsers = [];
    for (const user of users) {
        try {
            const encryptedPassword = await bcrypt.hash(user.password, 10);
            user.password = encryptedPassword;
            const newUser = await db.User.create(user);
            createdUsers.push(newUser);
        } catch (error) {
            failedUsers.push(user);
        }
    }
    return {
        code: 200,
        message: { success: createdUsers.length, failed: failedUsers.length }
    };
}

export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllActiveUsers,
    findUsers,
    bulkCreateUsers,
};