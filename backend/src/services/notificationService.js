const db = require('../config/database');
const { baseUrl } = require('../config/env');
const AnalyticsModel = require('../models/AnalyticsModel');
const ClassModel = require('../models/ClassModel');
const NotificationModel = require('../models/NotificationModel');
const StudentModel = require('../models/StudentModel');
const UserModel = require('../models/UserModel');
const PushService = require('./pushService');
const AppError = require('../utils/AppError');
const { resolveFileType } = require('../utils/fileHelpers');

class NotificationService {
  static async createNotification({ teacherId, payload, files = [] }) {
    const classRecord = await ClassModel.getTeacherClass(payload.class_id, teacherId);

    if (!classRecord) {
      throw new AppError('Teachers can only create notifications for their assigned classes', 403);
    }

    let studentIds = [];

    if (payload.target_type === 'students') {
      studentIds = payload.student_ids || [];

      if (!studentIds.length) {
        throw new AppError('Selected student IDs are required for student-targeted notifications', 422);
      }

      const studentsAreValid = await StudentModel.validateStudentsInClass(
        studentIds,
        payload.class_id
      );

      if (!studentsAreValid) {
        throw new AppError('Teachers can only target active students from their assigned class', 403);
      }
    }

    const notification = await db.transaction(async (trx) => {
      const created = await NotificationModel.create(
        {
          title: payload.title,
          message: payload.message,
          category_id: payload.category_id || null,
          class_id: payload.class_id,
          target_type: payload.target_type,
          status: 'pending',
          admin_note: payload.admin_note || null,
          created_by_teacher_id: teacherId,
          approved_by_admin_id: null
        },
        trx
      );

      if (payload.target_type === 'students') {
        await NotificationModel.createTargets(created.id, studentIds, trx);
      }

      if (files.length) {
        await NotificationModel.createMedia(
          created.id,
          files.map((file) => ({
            file_url: `${baseUrl.replace(/\/$/, '')}/uploads/${file.filename}`,
            file_type: resolveFileType(file.mimetype)
          })),
          trx
        );
      }

      return NotificationModel.findDetailedById(created.id, trx);
    });

    return notification;
  }

  static async listTeacherNotifications(teacherId) {
    const notifications = await NotificationModel.getTeacherNotifications(teacherId);

    return Promise.all(
      notifications.map((notification) => NotificationModel.findDetailedById(notification.id))
    );
  }

  static async listPendingNotifications() {
    const notifications = await NotificationModel.getPendingNotifications();

    return Promise.all(
      notifications.map((notification) => NotificationModel.findDetailedById(notification.id))
    );
  }

  static async listParentNotifications(parentId) {
    const notifications = await NotificationModel.getParentNotifications(parentId);

    return Promise.all(
      notifications.map((notification) => NotificationModel.findDetailedById(notification.id))
    );
  }

  static async approveNotification(notificationId, adminId, payload = {}) {
    const existing = await NotificationModel.findDetailedById(notificationId);

    if (!existing) {
      throw new AppError('Notification not found', 404);
    }

    if (existing.status === 'approved') {
      throw new AppError('Notification is already approved', 409);
    }

    const approvedNotification = await db.transaction(async (trx) => {
      if (payload.class_id) {
        const classRecord = await ClassModel.findById(payload.class_id, trx);

        if (!classRecord) {
          throw new AppError('Assigned class does not exist', 404);
        }
      }

      const nextClassId = payload.class_id || existing.class_id;
      const nextTargetType = payload.target_type || existing.target_type;
      const nextStudentIds =
        nextTargetType === 'students'
          ? payload.student_ids || existing.targets.map((target) => target.student_id)
          : [];

      if (nextTargetType === 'students') {
        if (!nextStudentIds.length) {
          throw new AppError('Student-targeted notifications must include at least one student', 422);
        }

        const studentsAreValid = await StudentModel.validateStudentsInClass(
          nextStudentIds,
          nextClassId,
          trx
        );

        if (!studentsAreValid) {
          throw new AppError('Selected students must belong to the notification class', 422);
        }
      }

      await NotificationModel.update(
        notificationId,
        {
          title: payload.title || existing.title,
          message: payload.message || existing.message,
          category_id: payload.category_id || existing.category_id || null,
          class_id: nextClassId,
          target_type: nextTargetType,
          status: 'approved',
          admin_note: payload.admin_note || existing.admin_note || null,
          approved_by_admin_id: adminId
        },
        trx
      );

      await NotificationModel.replaceTargets(notificationId, nextStudentIds, trx);

      const recipients =
        nextTargetType === 'class'
          ? await UserModel.listActiveParentsByClassId(nextClassId, trx)
          : await UserModel.listActiveParentsByStudentIds(nextStudentIds, trx);

      await AnalyticsModel.createSentEntries(
        notificationId,
        recipients.map((recipient) => recipient.id),
        trx
      );

      return NotificationModel.findDetailedById(notificationId, trx);
    });

    const recipients =
      approvedNotification.target_type === 'class'
        ? await UserModel.listActiveParentsByClassId(approvedNotification.class_id)
        : await UserModel.listActiveParentsByStudentIds(
            approvedNotification.targets.map((target) => target.student_id)
          );

    const pushResult = await PushService.sendNotification(
      approvedNotification,
      recipients.map((recipient) => recipient.id)
    );

    return {
      notification: approvedNotification,
      recipient_count: recipients.length,
      push: pushResult
    };
  }

  static async rejectNotification(notificationId, adminId, payload = {}) {
    const existing = await NotificationModel.findDetailedById(notificationId);

    if (!existing) {
      throw new AppError('Notification not found', 404);
    }

    const status = payload.status === 'needs_revision' ? 'needs_revision' : 'rejected';

    const notification = await NotificationModel.update(notificationId, {
      status,
      admin_note: payload.admin_note || null,
      approved_by_admin_id: adminId
    });

    return NotificationModel.findDetailedById(notification.id);
  }
}

module.exports = NotificationService;
