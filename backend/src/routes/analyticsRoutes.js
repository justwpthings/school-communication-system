const router = require('express').Router();

const AnalyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get(
  '/:notification_id',
  authenticate,
  authorize('admin', 'teacher'),
  AnalyticsController.analyticsValidation,
  AnalyticsController.getAnalytics
);

router.post(
  '/:notification_id/open',
  authenticate,
  authorize('parent'),
  AnalyticsController.analyticsValidation,
  AnalyticsController.markOpened
);

module.exports = router;
