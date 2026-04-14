const db = require('../config/database');

class SubscriptionModel {
  static async upsert(userId, payload, trx = db) {
    const existing = await trx('push_subscriptions')
      .where({ user_id: userId, endpoint: payload.endpoint })
      .first();

    if (existing) {
      await trx('push_subscriptions').where({ id: existing.id }).update({
        p256dh: payload.p256dh,
        auth: payload.auth
      });

      return { ...existing, ...payload };
    }

    const [id] = await trx('push_subscriptions').insert({
      user_id: userId,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth
    });

    return trx('push_subscriptions').where({ id }).first();
  }

  static listByUserIds(userIds, trx = db) {
    if (!userIds.length) {
      return Promise.resolve([]);
    }

    return trx('push_subscriptions')
      .select('id', 'user_id', 'endpoint', 'p256dh', 'auth')
      .whereIn('user_id', userIds);
  }

  static removeByEndpoint(userId, endpoint, trx = db) {
    return trx('push_subscriptions').where({ user_id: userId, endpoint }).del();
  }

  static removeById(id, trx = db) {
    return trx('push_subscriptions').where({ id }).del();
  }
}

module.exports = SubscriptionModel;
