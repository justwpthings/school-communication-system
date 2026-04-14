const AnalyticsModel = require('../models/AnalyticsModel');
const NotificationModel = require('../models/NotificationModel');
const AppError = require('../utils/AppError');

class AnalyticsService {
  static async markOpened(notificationId, userId) {
    const hasAccess = await NotificationModel.parentHasAccess(userId, notificationId);

    if (!hasAccess) {
      throw new AppError('Notification not found for this parent', 404);
    }

    await AnalyticsModel.createOpenedEntry(notificationId, userId);
  }

  static getNotificationAnalytics(notificationId) {
    return AnalyticsModel.getNotificationAnalytics(notificationId);
  }
}

module.exports = AnalyticsService;
