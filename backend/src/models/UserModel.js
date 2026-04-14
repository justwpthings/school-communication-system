const db = require('../config/database');

class UserModel {
  static findById(id, trx = db) {
    return trx('users')
      .select('id', 'name', 'email', 'phone', 'role', 'status', 'is_active', 'created_at', 'updated_at')
      .where({ id })
      .first();
  }

  static findByEmail(email, trx = db) {
    return trx('users')
      .select(
        'id',
        'name',
        'email',
        'phone',
        'password_hash',
        'role',
        'status',
        'is_active',
        'created_at',
        'updated_at'
      )
      .whereRaw('LOWER(email) = LOWER(?)', [email])
      .first();
  }

  static async createParent(payload, trx = db) {
    const [id] = await trx('users').insert(payload);
    return this.findById(id, trx);
  }

  static listPendingParents(trx = db) {
    return trx('users')
      .select('id', 'name', 'email', 'phone', 'status', 'is_active', 'created_at')
      .where({ role: 'parent', status: 'pending', is_active: true })
      .orderBy('created_at', 'asc');
  }

  static async updateStatus(id, status, trx = db) {
    await trx('users').where({ id }).update({ status, updated_at: trx.fn.now() });
    return this.findById(id, trx);
  }

  static listActiveParentsByClassId(classId, trx = db) {
    return trx('users as u')
      .distinct('u.id', 'u.name', 'u.email')
      .join('parent_student as ps', 'ps.parent_id', 'u.id')
      .join('students as s', 's.id', 'ps.student_id')
      .where({
        'u.role': 'parent',
        'u.status': 'approved',
        'u.is_active': true,
        's.class_id': classId,
        's.is_active': true
      });
  }

  static listActiveParentsByStudentIds(studentIds, trx = db) {
    return trx('users as u')
      .distinct('u.id', 'u.name', 'u.email')
      .join('parent_student as ps', 'ps.parent_id', 'u.id')
      .join('students as s', 's.id', 'ps.student_id')
      .whereIn('ps.student_id', studentIds)
      .andWhere({
        'u.role': 'parent',
        'u.status': 'approved',
        'u.is_active': true,
        's.is_active': true
      });
  }
}

module.exports = UserModel;
