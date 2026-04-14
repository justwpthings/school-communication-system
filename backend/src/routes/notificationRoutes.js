const router = require('express').Router();

const NotificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { uploadNotificationMedia } = require('../middleware/upload');

router.post(
  '/',
  authenticate,
  authorize('teacher'),
  uploadNotificationMedia,
  NotificationController.createNotificationValidation,
  NotificationController.createNotification
);

router.get('/my', authenticate, authorize('teacher'), NotificationController.getMyNotifications);
router.get('/pending', authenticate, authorize('admin'), NotificationController.getPendingNotifications);
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  NotificationController.approveNotificationValidation,
  NotificationController.approveNotification
);
router.post(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  NotificationController.rejectNotificationValidation,
  NotificationController.rejectNotification
);
router.get('/', authenticate, authorize('parent'), NotificationController.getParentNotifications);

module.exports = router;
