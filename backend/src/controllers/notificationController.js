const { body, param } = require('express-validator');

const NotificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { deleteFiles } = require('../utils/fileHelpers');

const createNotificationValidation = validate([
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('class_id').isInt({ min: 1 }).withMessage('A valid class_id is required'),
  body('category_id')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('category_id must be a positive integer'),
  body('target_type')
    .isIn(['class', 'students'])
    .withMessage('target_type must be class or students'),
  body('student_ids')
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) {
        return value.map(Number);
      }

      if (typeof value === 'string' && value.trim()) {
        return value
          .split(',')
          .map((id) => Number(id.trim()))
          .filter(Boolean);
      }

      return [];
    }),
  body('student_ids')
    .optional()
    .isArray()
    .withMessage('student_ids must be an array of student IDs'),
  body('student_ids.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each student ID must be a positive integer')
]);

const notificationIdValidation = validate([
  param('id').isInt({ min: 1 }).withMessage('A valid notification ID is required')
]);

const approveNotificationValidation = validate([
  param('id').isInt({ min: 1 }).withMessage('A valid notification ID is required'),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty'),
  body('message').optional().trim().notEmpty().withMessage('message cannot be empty'),
  body('class_id').optional().isInt({ min: 1 }).withMessage('class_id must be valid'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('category_id must be valid'),
  body('target_type').optional().isIn(['class', 'students']).withMessage('Invalid target_type'),
  body('student_ids')
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) {
        return value.map(Number);
      }

      if (typeof value === 'string' && value.trim()) {
        return value
          .split(',')
          .map((id) => Number(id.trim()))
          .filter(Boolean);
      }

      return [];
    }),
  body('student_ids')
    .optional()
    .isArray()
    .withMessage('student_ids must be an array'),
  body('student_ids.*').optional().isInt({ min: 1 }).withMessage('Invalid student ID')
]);

const rejectNotificationValidation = validate([
  param('id').isInt({ min: 1 }).withMessage('A valid notification ID is required'),
  body('status')
    .optional()
    .isIn(['rejected', 'needs_revision'])
    .withMessage('status must be rejected or needs_revision'),
  body('admin_note')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('admin_note cannot be empty when provided')
]);

const createNotification = async (req, res, next) => {
  try {
    const notification = await NotificationService.createNotification({
      teacherId: req.user.id,
      payload: req.body,
      files: req.files || []
    });

    res.status(201).json({
      success: true,
      message: 'Notification created and sent for admin approval',
      data: notification
    });
  } catch (error) {
    deleteFiles(req.files || []);
    next(error);
  }
};

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.listTeacherNotifications(req.user.id);

  res.json({
    success: true,
    data: notifications
  });
});

const getPendingNotifications = asyncHandler(async (_req, res) => {
  const notifications = await NotificationService.listPendingNotifications();

  res.json({
    success: true,
    data: notifications
  });
});

const approveNotification = asyncHandler(async (req, res) => {
  const result = await NotificationService.approveNotification(
    Number(req.params.id),
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    message: 'Notification approved and delivered to active parent recipients',
    data: result
  });
});

const rejectNotification = asyncHandler(async (req, res) => {
  const notification = await NotificationService.rejectNotification(
    Number(req.params.id),
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    message: `Notification marked as ${notification.status}`,
    data: notification
  });
});

const getParentNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.listParentNotifications(req.user.id);

  res.json({
    success: true,
    data: notifications
  });
});

module.exports = {
  createNotificationValidation,
  notificationIdValidation,
  approveNotificationValidation,
  rejectNotificationValidation,
  createNotification,
  getMyNotifications,
  getPendingNotifications,
  approveNotification,
  rejectNotification,
  getParentNotifications
};
