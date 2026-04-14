const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const { comparePassword, hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

class AuthService {
  static async signupParent({ name, email, phone, password }) {
    const existing = await UserModel.findByEmail(email);

    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await UserModel.createParent({
      name,
      email,
      phone,
      password_hash: passwordHash,
      role: 'parent',
      status: 'pending',
      is_active: true
    });

    return user;
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      throw new AppError('User account is inactive', 403);
    }

    if (user.status !== 'approved') {
      throw new AppError(`User account is ${user.status}`, 403);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        is_active: user.is_active
      }
    };
  }
}

module.exports = AuthService;
