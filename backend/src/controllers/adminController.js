const { body } = require('express-validator');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const UserModel = require('../models/UserModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validate } = require('../middleware/validate');

const bcrypt = require('bcrypt');
const db = require('../config/database');

const DEFAULT_TEACHER_PASSWORD = 'Teacher@123';

const parseTeachersCsv = (buffer) =>
  new Promise((resolve, reject) => {
    const rows = [];

    Readable.from([buffer])
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase()
        })
      )
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });

// ---------------- VALIDATION ----------------

const parentDecisionValidation = validate([
  body('user_id').isInt({ min: 1 }).withMessage('A valid user_id is required')
]);

// ---------------- PARENT MANAGEMENT ----------------

const getPendingParents = asyncHandler(async (_req, res) => {
  const parents = await UserModel.listPendingParents();

  res.json({
    success: true,
    data: parents
  });
});

const approveParent = asyncHandler(async (req, res) => {
  const parent = await UserModel.findById(req.body.user_id);

  if (!parent || parent.role !== 'parent') {
    throw new AppError('Parent account not found', 404);
  }

  const updated = await UserModel.updateStatus(parent.id, 'approved');

  res.json({
    success: true,
    message: 'Parent approved successfully',
    data: updated
  });
});

const rejectParent = asyncHandler(async (req, res) => {
  const parent = await UserModel.findById(req.body.user_id);

  if (!parent || parent.role !== 'parent') {
    throw new AppError('Parent account not found', 404);
  }

  const updated = await UserModel.updateStatus(parent.id, 'rejected');

  res.json({
    success: true,
    message: 'Parent rejected successfully',
    data: updated
  });
});

// ---------------- TEACHER ----------------

const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db('users').insert({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role: 'teacher',
      status: 'approved',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Teacher created successfully',
      data: { id: result }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher'
    });
  }
};

const importTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const rows = await parseTeachersCsv(req.file.buffer);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }

    const teachers = rows.map((row, index) => {
      const name = row.name?.trim();
      const email = row.email?.trim();
      const phone = row.phone?.trim() || null;

      if (!name || !email) {
        throw new AppError(`Invalid CSV data on row ${index + 2}`, 400);
      }

      return {
        name,
        email,
        phone,
        role: 'teacher',
        status: 'approved',
        is_active: 1
      };
    });

    const hashedPassword = await bcrypt.hash(DEFAULT_TEACHER_PASSWORD, 10);
    const timestamp = new Date();

    await db.transaction(async (trx) => {
      await trx('users').insert(
        teachers.map((teacher) => ({
          ...teacher,
          password_hash: hashedPassword,
          created_at: timestamp,
          updated_at: timestamp
        }))
      );
    });

    return res.json({
      success: true,
      message: 'Teachers imported successfully',
      count: teachers.length
    });
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error importing teachers'
    });
  }
};

// ---------------- CLASS ----------------

const createClass = async (req, res) => {
  try {
    const { class_name, section, teacher_id } = req.body;

    const [result] = await db('classes').insert({
      class_name,
      section,
      teacher_id
    });

    res.json({
      success: true,
      message: 'Class created successfully',
      data: { id: result }
    });
  } catch (error) {
    console.error("CREATE CLASS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ---------------- STUDENT ----------------

const createStudent = async (req, res) => {
  try {
    const { name, class_id, roll_number } = req.body;

    const [result] = await db('students').insert({
      name,
      class_id,
      roll_number,
      is_active: 1,
      created_at: new Date()
    });

    res.json({
      success: true,
      message: 'Student created successfully',
      data: { id: result }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating student'
    });
  }
};

// ---------------- LINK PARENT ----------------

const linkParentStudent = async (req, res) => {
  try {
    const { parent_id, student_id } = req.body;

    await db('parent_student').insert({
      parent_id,
      student_id
    });

    res.json({
      success: true,
      message: 'Parent linked to student successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error linking parent and student'
    });
  }
};

// ---------------- LIST DATA ----------------


const getParents = async (req, res) => {
  const parents = await db('users')
    .where({ role: 'parent' })
    .select('id', 'name', 'email', 'status');

  res.json({ success: true, data: parents });
};

const getClasses = async (req, res) => {
  const classes = await db('classes')
    .join('users', 'classes.teacher_id', 'users.id')
    .select(
      'classes.id',
      'class_name',
      'section',
      'users.name as teacher_name'
    );

  res.json({ success: true, data: classes });
};

// ---------------- DELETE ----------------

const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  await db('users').where({ id, role: 'teacher' }).del();

  res.json({ success: true, message: 'Teacher deleted' });
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  await db('students').where({ id }).del();

  res.json({ success: true, message: 'Student deleted' });
};

const deactivateParent = async (req, res) => {
  const { id } = req.params;

  await db('users')
    .where({ id, role: 'parent' })
    .update({ is_active: 0 });

  res.json({ success: true, message: 'Parent deactivated' });
};


// ---------------- Get Teachers ----------------

const getTeachers = async (req, res) => {
  try {
    const teachers = await db('users')
      .where({ role: 'teacher' })
      .select('id', 'name', 'email', 'phone', 'created_at');

    const result = await Promise.all(
      teachers.map(async (teacher) => {
        const classes = await db('classes')
          .where({ teacher_id: teacher.id })
          .select('class_name', 'section');

        return {
          ...teacher,
          classes
        };
      })
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers'
    });
  }
};

// ---------------- Get Students ----------------

const getStudents = async (req, res) => {
  try {
    const students = await db('students')
      .join('classes', 'students.class_id', 'classes.id')
      .leftJoin('parent_student', 'students.id', 'parent_student.student_id')
      .leftJoin('users as parents', 'parent_student.parent_id', 'parents.id')
      .select(
        'students.id',
        'students.name',
        'students.roll_number',
        'students.created_at',
        'classes.class_name',
        'classes.section',
        'parents.name as parent_name',
        'parents.email as parent_email',
        'parents.phone as parent_phone'
      );

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};

// ---------------- Update Teachers ----------------

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, is_active } = req.body;

    await db('users')
      .where({ id, role: 'teacher' })
      .update({
        name,
        email,
        phone,
        is_active
      });

    res.json({ success: true, message: 'Teacher updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// ---------------- Update Students ----------------

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      roll_number,
      class_id,
      parent_name,
      parent_email,
      parent_phone
    } = req.body;

    // update student
    await db('students')
      .where({ id })
      .update({
        name,
        roll_number,
        class_id
      });

    // find parent
    const link = await db('parent_student')
      .where({ student_id: id })
      .first();

    if (link) {
      await db('users')
        .where({ id: link.parent_id })
        .update({
          name: parent_name,
          email: parent_email,
          phone: parent_phone
        });
    }

    res.json({ success: true, message: 'Student updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// ---------------- Bulk Teachers Export----------------
const exportTeachers = async (req, res) => {
  try {
    const teachers = await db('users')
      .where({ role: 'teacher' })
      .select('name', 'email', 'phone');

    // CSV header
    const header = ['Name', 'Email', 'Phone'];

    // Convert rows
    const rows = teachers.map(t => [
      t.name,
      t.email,
      t.phone
    ]);

    // Combine header + rows
    const csv = [
      header,
      ...rows
    ]
      .map(row => row.join(','))   // columns
      .join('\n');                 // rows ✅ IMPORTANT

    // Send as file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=teachers.csv');

    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
};

// ---------------- EXPORTS ----------------

module.exports = {
  parentDecisionValidation,
  getPendingParents,
  approveParent,
  rejectParent,
  createTeacher,
  createClass,
  createStudent,
  linkParentStudent,
  getTeachers,
  getStudents,
  getParents,
  getClasses,
  deleteTeacher,
  deleteStudent,
  deactivateParent,
  importTeachers,
  updateTeacher,
  updateStudent,
  exportTeachers
};
