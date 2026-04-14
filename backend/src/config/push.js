const webpush = require('web-push');
const { vapidPrivateKey, vapidPublicKey, vapidSubject } = require('./env');

let pushConfigured = false;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  pushConfigured = true;
} else {
  console.warn('Web Push is disabled because VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are not configured.');
}

module.exports = {
  webpush,
  pushConfigured,
  vapidPublicKey
};
