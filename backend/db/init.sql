SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'parent') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status_active (role, status, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS classes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_name VARCHAR(100) NOT NULL,
  section VARCHAR(20) NOT NULL,
  teacher_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_classes_name_section (class_name, section),
  KEY idx_classes_teacher_id (teacher_id),
  CONSTRAINT fk_classes_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  class_id INT UNSIGNED NOT NULL,
  roll_number VARCHAR(30) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_class_roll (class_id, roll_number),
  KEY idx_students_class_active (class_id, is_active),
  CONSTRAINT fk_students_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parent_student (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_parent_student (parent_id, student_id),
  KEY idx_parent_student_student_id (student_id),
  CONSTRAINT fk_parent_student_parent
    FOREIGN KEY (parent_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_parent_student_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  created_by_admin_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  KEY idx_categories_admin (created_by_admin_id),
  CONSTRAINT fk_categories_admin
    FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category_id INT UNSIGNED NULL,
  class_id INT UNSIGNED NOT NULL,
  target_type ENUM('class', 'students') NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'needs_revision') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  created_by_teacher_id INT UNSIGNED NOT NULL,
  approved_by_admin_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_status (status),
  KEY idx_notifications_teacher (created_by_teacher_id),
  KEY idx_notifications_class (class_id),
  KEY idx_notifications_admin (approved_by_admin_id),
  CONSTRAINT fk_notifications_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_notifications_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_notifications_teacher
    FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_notifications_admin
    FOREIGN KEY (approved_by_admin_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_targets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  notification_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notification_targets (notification_id, student_id),
  KEY idx_notification_targets_student (student_id),
  CONSTRAINT fk_notification_targets_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_notification_targets_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_media (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  notification_id INT UNSIGNED NOT NULL,
  file_url VARCHAR(2048) NOT NULL,
  file_type ENUM('image', 'video', 'pdf') NOT NULL,
  PRIMARY KEY (id),
  KEY idx_notification_media_notification (notification_id),
  CONSTRAINT fk_notification_media_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_analytics (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  notification_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('sent', 'opened') NOT NULL,
  sent_at TIMESTAMP NULL DEFAULT NULL,
  opened_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notification_analytics_state (notification_id, user_id, status),
  KEY idx_notification_analytics_user (user_id),
  CONSTRAINT fk_notification_analytics_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_notification_analytics_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_push_subscriptions_user (user_id),
  CONSTRAINT fk_push_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
