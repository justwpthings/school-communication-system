const router = require('express').Router();

const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const db = require('../config/database');

// All routes require teacher
router.use(authenticate, authorize('teacher'));

// ---------------- GET MY CLASSES ----------------
router.get('/classes', async (req, res) => {
  try {
    const teacherId = req.user.id;

    const classes = await db('classes')
      .where({ teacher_id: teacherId });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes'
    });
  }
});

// ---------------- GET STUDENTS BY CLASS ----------------
router.get('/students', async (req, res) => {
  try {
    const { class_id } = req.query;

    const students = await db('students')
      .where({ class_id });

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
});

module.exports = router;