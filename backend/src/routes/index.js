const router = require('express').Router();

console.log('LOADING ROUTES FILE...');

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes.js');
console.log('ADMIN ROUTES LOADED TYPE:', typeof adminRoutes);
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/push-subscriptions', subscriptionRoutes);

module.exports = router;