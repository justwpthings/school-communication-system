const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { deleteFiles } = require('../utils/fileHelpers');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  if (req.files?.length) {
    deleteFiles(req.files);
  }

  return next(new AppError('Validation failed', 422, errors.array()));
};

module.exports = {
  validate
};
