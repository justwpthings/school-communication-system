const router = require('express').Router();

const SubscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

router.get('/public-key', authenticate, SubscriptionController.getPublicKey);
router.post(
  '/',
  authenticate,
  SubscriptionController.subscriptionValidation,
  SubscriptionController.saveSubscription
);
router.delete(
  '/',
  authenticate,
  SubscriptionController.deleteSubscriptionValidation,
  SubscriptionController.deleteSubscription
);

module.exports = router;
