const db = require('../config/database');

class NotificationModel {
  static async create(payload, trx = db) {
    const [id] = await trx('notifications').insert(payload);
    return this.findById(id, trx);
  }

  static async update(id, payload, trx = db) {
    await trx('notifications').where({ id }).update({ ...payload, updated_at: trx.fn.now() });
    return this.findById(id, trx);
  }

  static createTargets(notificationId, studentIds, trx = db) {
    if (!studentIds.length) {
      return Promise.resolve();
    }

    return trx('notification_targets').insert(
      studentIds.map((studentId) => ({
        notification_id: notificationId,
        student_id: studentId
      }))
    );
  }

  static async replaceTargets(notificationId, studentIds, trx = db) {
    await trx('notification_targets').where({ notification_id: notificationId }).del();
    return this.createTargets(notificationId, studentIds, trx);
  }

  static createMedia(notificationId, mediaItems, trx = db) {
    if (!mediaItems.length) {
      return Promise.resolve();
    }

    return trx('notification_media').insert(
      mediaItems.map((item) => ({
        notification_id: notificationId,
        file_url: item.file_url,
        file_type: item.file_type
      }))
    );
  }

  static findById(id, trx = db) {
    return trx('notifications as n')
      .select(
        'n.*',
        'c.class_name',
        'c.section',
        'cat.name as category_name',
        'teacher.name as teacher_name',
        'admin.name as admin_name'
      )
      .leftJoin('classes as c', 'c.id', 'n.class_id')
      .leftJoin('categories as cat', 'cat.id', 'n.category_id')
      .leftJoin('users as teacher', 'teacher.id', 'n.created_by_teacher_id')
      .leftJoin('users as admin', 'admin.id', 'n.approved_by_admin_id')
      .where('n.id', id)
      .first();
  }

  static getTargets(notificationId, trx = db) {
    return trx('notification_targets as nt')
      .select('nt.student_id', 's.name as student_name', 's.roll_number')
      .join('students as s', 's.id', 'nt.student_id')
      .where('nt.notification_id', notificationId)
      .orderBy('s.roll_number', 'asc');
  }

  static getMedia(notificationId, trx = db) {
    return trx('notification_media')
      .select('id', 'notification_id', 'file_url', 'file_type')
      .where({ notification_id: notificationId })
      .orderBy('id', 'asc');
  }

  static getTeacherNotifications(teacherId, trx = db) {
    return trx('notifications as n')
      .select('n.*', 'c.class_name', 'c.section', 'cat.name as category_name')
      .leftJoin('classes as c', 'c.id', 'n.class_id')
      .leftJoin('categories as cat', 'cat.id', 'n.category_id')
      .where('n.created_by_teacher_id', teacherId)
      .orderBy('n.created_at', 'desc');
  }

  static getPendingNotifications(trx = db) {
    return trx('notifications as n')
      .select('n.*', 'c.class_name', 'c.section', 'cat.name as category_name', 'u.name as teacher_name')
      .leftJoin('classes as c', 'c.id', 'n.class_id')
      .leftJoin('categories as cat', 'cat.id', 'n.category_id')
      .leftJoin('users as u', 'u.id', 'n.created_by_teacher_id')
      .where('n.status', 'pending')
      .orderBy('n.created_at', 'asc');
  }

  static getParentNotifications(parentId, trx = db) {
    return trx('notifications as n')
      .distinct(
        'n.id',
        'n.title',
        'n.message',
        'n.category_id',
        'n.class_id',
        'n.target_type',
        'n.status',
        'n.admin_note',
        'n.created_by_teacher_id',
        'n.approved_by_admin_id',
        'n.created_at',
        'n.updated_at',
        'c.class_name',
        'c.section',
        'cat.name as category_name'
      )
      .leftJoin('classes as c', 'c.id', 'n.class_id')
      .leftJoin('categories as cat', 'cat.id', 'n.category_id')
      .where('n.status', 'approved')
      .andWhere(function parentCanSee() {
        this.whereExists(function visibleToParent() {
          this.select(trx.raw('1'))
            .from('parent_student as ps')
            .join('students as s', 's.id', 'ps.student_id')
            .leftJoin('notification_targets as nt', function joinTargets() {
              this.on('nt.notification_id', '=', 'n.id').andOn('nt.student_id', '=', 's.id');
            })
            .where('ps.parent_id', parentId)
            .andWhere('s.is_active', true)
            .andWhere(function matchTarget() {
              this.where(function byClass() {
                this.where('n.target_type', 'class').andWhereRaw('n.class_id = s.class_id');
              }).orWhere(function byStudent() {
                this.where('n.target_type', 'students').andWhereNotNull('nt.id');
              });
            });
        });
      })
      .orderBy('n.created_at', 'desc');
  }

  static async findDetailedById(id, trx = db) {
    const notification = await this.findById(id, trx);

    if (!notification) {
      return null;
    }

    const [targets, media] = await Promise.all([
      this.getTargets(id, trx),
      this.getMedia(id, trx)
    ]);

    return {
      ...notification,
      targets,
      media
    };
  }

  static async parentHasAccess(parentId, notificationId, trx = db) {
    const notification = await trx('notifications as n')
      .where('n.id', notificationId)
      .andWhere('n.status', 'approved')
      .andWhere(function parentCanSee() {
        this.whereExists(function visibleToParent() {
          this.select(trx.raw('1'))
            .from('parent_student as ps')
            .join('students as s', 's.id', 'ps.student_id')
            .leftJoin('notification_targets as nt', function joinTargets() {
              this.on('nt.notification_id', '=', 'n.id').andOn('nt.student_id', '=', 's.id');
            })
            .where('ps.parent_id', parentId)
            .andWhere('s.is_active', true)
            .andWhere(function matchTarget() {
              this.where(function byClass() {
                this.where('n.target_type', 'class').andWhereRaw('n.class_id = s.class_id');
              }).orWhere(function byStudent() {
                this.where('n.target_type', 'students').andWhereNotNull('nt.id');
              });
            });
        });
      })
      .first('n.id');

    return Boolean(notification);
  }
}

module.exports = NotificationModel;
