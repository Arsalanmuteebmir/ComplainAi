import { Router } from 'express';
import { auth, requireRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import {
  createComplaint,
  myComplaints,
  getComplaint,
  adminComplaints,
  verifyComplaint,
  forwardComplaint,
  updateStatus,
  closeComplaint,
  archiveComplaint,
  unarchiveComplaint,
  analytics
} from '../controllers/complaint.controller.js';

const r = Router();

r.use(auth);

// Citizen
r.post(
  '/',
  requireRoles('USER'),
  upload.single('image'),
  createComplaint
);

r.get(
  '/mine',
  requireRoles('USER'),
  myComplaints
);

// Admin
r.get(
  '/analytics',
  requireRoles('CATEGORY_ADMIN', 'SUPER_ADMIN'),
  analytics
);

r.get(
  '/admin/all',
  requireRoles('CATEGORY_ADMIN', 'SUPER_ADMIN'),
  adminComplaints
);

// Individual complaint
r.get('/:id', getComplaint);

// Verification and forwarding
r.patch(
  '/:id/verify',
  requireRoles('CATEGORY_ADMIN', 'SUPER_ADMIN'),
  verifyComplaint
);

r.patch(
  '/:id/forward',
  requireRoles('CATEGORY_ADMIN', 'SUPER_ADMIN'),
  forwardComplaint
);

// Work status
r.patch(
  '/:id/status',
  requireRoles('CATEGORY_ADMIN', 'SUPER_ADMIN'),
  updateStatus
);

// Super Admin lifecycle controls
r.patch(
  '/:id/close',
  requireRoles('SUPER_ADMIN'),
  closeComplaint
);

r.patch(
  '/:id/archive',
  requireRoles('SUPER_ADMIN'),
  archiveComplaint
);

r.patch(
  '/:id/unarchive',
  requireRoles('SUPER_ADMIN'),
  unarchiveComplaint
);

export default r;
