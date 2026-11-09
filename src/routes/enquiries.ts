import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../controllers/enquiryController';

const router = Router();

// @route   POST /api/enquiries
// @desc    Submit the contact form (public)
router.post('/', createEnquiry);

// @route   GET /api/enquiries
// @desc    List enquiries (ADMIN ONLY)
router.get('/', protect, admin, getEnquiries);

// @route   PUT /api/enquiries/:id/status
// @desc    Update an enquiry's status (ADMIN ONLY)
router.put('/:id/status', protect, admin, updateEnquiryStatus);

// @route   DELETE /api/enquiries/:id
// @desc    Delete an enquiry (ADMIN ONLY)
router.delete('/:id', protect, admin, deleteEnquiry);

export default router;
