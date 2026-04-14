const { baseUrl } = require('../config/env');
const { pushConfigured, vapidPublicKey, webpush } = require('../config/push');
const SubscriptionModel = require('../models/SubscriptionModel');

class PushService {
  static getPublicKeyState() {
    return {
      enabled: pushConfigured,
      publicKey: vapidPublicKey || null
    };
  }

  static async sendNotification(notification, userIds) {
    const subscriptions = await SubscriptionModel.listByUserIds(userIds);

    if (!pushConfigured || !subscriptions.length) {
      return {
        push_enabled: pushConfigured,
        subscribed_recipients: subscriptions.length,
        delivered: 0
      };
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      url: `${baseUrl.replace(/\/$/, '')}/notifications/${notification.id}`
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          );

          return subscription.id;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await SubscriptionModel.removeById(subscription.id);
          }

          return null;
        }
      })
    );

    return {
      push_enabled: true,
      subscribed_recipients: subscriptions.length,
      delivered: results.filter((result) => result.status === 'fulfilled' && result.value).length
    };
  }
}

module.exports = PushService;
