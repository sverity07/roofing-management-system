const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getJobs)
  .post(authorize('owner'), createJob);

router.get('/stats', getJobStats);

router.route('/:id')
  .get(getJob)
  .put(authorize('owner'), updateJob)
  .delete(authorize('owner'), deleteJob);

module.exports = router;