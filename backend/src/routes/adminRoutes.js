const router = require('express').Router();
const multer = require('multer');

console.log('ADMIN ROUTES LOADED');

const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const uploadTeachersCsv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

// All routes require admin
router.use(authenticate, authorize('admin'));

// ---------------- PARENT ----------------
router.get('/pending-parents', AdminController.getPendingParents);
router.post('/approve-parent', AdminController.parentDecisionValidation, AdminController.approveParent);
router.post('/reject-parent', AdminController.parentDecisionValidation, AdminController.rejectParent);

// ---------------- TEACHER ----------------
router.post('/create-teacher', AdminController.createTeacher);

// ---------------- CLASS ----------------
router.post('/create-class', AdminController.createClass);

// ---------------- STUDENT ----------------
router.post('/create-student', AdminController.createStudent);

// ---------------- LINK ----------------
router.post('/link-parent-student', AdminController.linkParentStudent);

// ---------------- LIST (NEW) ----------------
router.post('/teachers/import', uploadTeachersCsv.single('file'), AdminController.importTeachers);
router.get('/teachers/export', AdminController.exportTeachers);
router.get('/teachers', AdminController.getTeachers);
router.get('/students', AdminController.getStudents);
router.get('/parents', AdminController.getParents);
router.get('/classes', AdminController.getClasses);

// ---------------- ACTIONS (NEW) ----------------
router.put('/teacher/:id', AdminController.updateTeacher);
router.delete('/teacher/:id', AdminController.deleteTeacher);
router.put('/student/:id', AdminController.updateStudent);
router.delete('/student/:id', AdminController.deleteStudent);
router.post('/parent/:id/deactivate', AdminController.deactivateParent);

module.exports = router;
