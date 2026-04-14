const { body } = require('express-validator');

const SubscriptionModel = require('../models/SubscriptionModel');
const PushService = require('../services/pushService');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');

const subscriptionValidation = validate([
  body('endpoint').isString().notEmpty().withMessage('endpoint is required'),
  body('keys.p256dh').isString().notEmpty().withMessage('keys.p256dh is required'),
  body('keys.auth').isString().notEmpty().withMessage('keys.auth is required')
]);

const deleteSubscriptionValidation = validate([
  body('endpoint').isString().notEmpty().withMessage('endpoint is required')
]);

const getPublicKey = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: PushService.getPublicKeyState()
  });
});

const saveSubscription = asyncHandler(async (req, res) => {
  const subscription = await SubscriptionModel.upsert(req.user.id, {
    endpoint: req.body.endpoint,
    p256dh: req.body.keys.p256dh,
    auth: req.body.keys.auth
  });

  res.status(201).json({
    success: true,
    message: 'Push subscription saved',
    data: subscription
  });
});

const deleteSubscription = asyncHandler(async (req, res) => {
  await SubscriptionModel.removeByEndpoint(req.user.id, req.body.endpoint);

  res.json({
    success: true,
    message: 'Push subscription removed'
  });
});

module.exports = {
  subscriptionValidation,
  deleteSubscriptionValidation,
  getPublicKey,
  saveSubscription,
  deleteSubscription
};
