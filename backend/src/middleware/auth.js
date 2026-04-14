const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401);
    }

    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.id);

    if (!user || !user.is_active) {
      throw new AppError('User account is inactive or missing', 401);
    }

    if (user.status !== 'approved') {
      throw new AppError('User account is not approved', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError('Invalid or expired token', 401));
  }
};

module.exports = {
  authenticate
};
