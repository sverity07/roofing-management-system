const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getStatus,
  getTimeEntries,
  approveTimeEntry
} = require('../controllers/timeTracking.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Employee routes
router.post('/clock-in', authorize('employee'), clockIn);
router.post('/clock-out', authorize('employee'), clockOut);
router.get('/status', authorize('employee'), getStatus);

// Shared routes
router.get('/entries', getTimeEntries);

// Owner routes
router.put('/entries/:id/approve', authorize('owner'), approveTimeEntry);

module.exports = router;