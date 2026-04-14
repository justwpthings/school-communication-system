const db = require('../config/database');

class ClassModel {
  static findById(id, trx = db) {
    return trx('classes as c')
      .select('c.id', 'c.class_name', 'c.section', 'c.teacher_id', 'u.name as teacher_name')
      .join('users as u', 'u.id', 'c.teacher_id')
      .where('c.id', id)
      .first();
  }

  static getTeacherClass(classId, teacherId, trx = db) {
    return trx('classes')
      .select('id', 'class_name', 'section', 'teacher_id')
      .where({ id: classId, teacher_id: teacherId })
      .first();
  }
}

module.exports = ClassModel;
