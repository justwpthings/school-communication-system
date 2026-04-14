const db = require('../config/database');

class AnalyticsModel {
  static async createSentEntries(notificationId, userIds, trx = db) {
    if (!userIds.length) {
      return;
    }

    const existing = await trx('notification_analytics')
      .select('user_id')
      .where({ notification_id: notificationId, status: 'sent' })
      .whereIn('user_id', userIds);

    const existingUserIds = new Set(existing.map((entry) => entry.user_id));
    const rows = userIds
      .filter((userId) => !existingUserIds.has(userId))
      .map((userId) => ({
        notification_id: notificationId,
        user_id: userId,
        status: 'sent',
        sent_at: trx.fn.now(),
        opened_at: null
      }));

    if (rows.length) {
      await trx('notification_analytics').insert(rows);
    }
  }

  static async createOpenedEntry(notificationId, userId, trx = db) {
    const existing = await trx('notification_analytics')
      .where({
        notification_id: notificationId,
        user_id: userId,
        status: 'opened'
      })
      .first();

    if (!existing) {
      await trx('notification_analytics').insert({
        notification_id: notificationId,
        user_id: userId,
        status: 'opened',
        sent_at: null,
        opened_at: trx.fn.now()
      });
    }
  }

  static async getNotificationAnalytics(notificationId, trx = db) {
    const recipients = await trx('notification_analytics as na')
      .select(
        'na.user_id',
        'u.name',
        'u.email',
        trx.raw("MAX(CASE WHEN na.status = 'sent' THEN na.sent_at END) as sent_at"),
        trx.raw("MAX(CASE WHEN na.status = 'opened' THEN na.opened_at END) as opened_at")
      )
      .join('users as u', 'u.id', 'na.user_id')
      .where('na.notification_id', notificationId)
      .groupBy('na.user_id', 'u.name', 'u.email')
      .orderBy('u.name', 'asc');

    const [counts] = await trx('notification_analytics')
      .where({ notification_id: notificationId })
      .select(
        trx.raw("COUNT(DISTINCT CASE WHEN status = 'sent' THEN user_id END) as sent_count"),
        trx.raw("COUNT(DISTINCT CASE WHEN status = 'opened' THEN user_id END) as opened_count")
      );

    return {
      sent_count: Number(counts.sent_count || 0),
      opened_count: Number(counts.opened_count || 0),
      recipients
    };
  }
}

module.exports = AnalyticsModel;
