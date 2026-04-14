const db = require('../config/database');

class StudentModel {
  static listByIds(studentIds, trx = db) {
    return trx('students')
      .select('id', 'name', 'class_id', 'roll_number', 'is_active', 'created_at')
      .whereIn('id', studentIds);
  }

  static listActiveByClassId(classId, trx = db) {
    return trx('students')
      .select('id', 'name', 'class_id', 'roll_number', 'is_active', 'created_at')
      .where({ class_id: classId, is_active: true })
      .orderBy('roll_number', 'asc');
  }

  static async validateStudentsInClass(studentIds, classId, trx = db) {
    const students = await trx('students')
      .select('id')
      .whereIn('id', studentIds)
      .andWhere({ class_id: classId, is_active: true });

    return students.length === studentIds.length;
  }
}

module.exports = StudentModel;
