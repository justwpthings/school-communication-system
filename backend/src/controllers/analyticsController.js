const { param } = require('express-validator');

const AnalyticsService = require('../services/analyticsService');
const NotificationModel = require('../models/NotificationModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validate } = require('../middleware/validate');

const analyticsValidation = validate([
  param('notification_id').isInt({ min: 1 }).withMessage('A valid notification_id is required')
]);

const getAnalytics = asyncHandler(async (req, res) => {
  const notification = await NotificationModel.findById(req.params.notification_id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (req.user.role === 'teacher' && notification.created_by_teacher_id !== req.user.id) {
    throw new AppError('Teachers can only view analytics for their own notifications', 403);
  }

  const analytics = await AnalyticsService.getNotificationAnalytics(req.params.notification_id);

  res.json({
    success: true,
    data: analytics
  });
});

const markOpened = asyncHandler(async (req, res) => {
  await AnalyticsService.markOpened(Number(req.params.notification_id), req.user.id);

  res.json({
    success: true,
    message: 'Notification open tracked'
  });
});

module.exports = {
  analyticsValidation,
  getAnalytics,
  markOpened
};
