const { TimeEntry, Job, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Clock in
// @route   POST /api/time-tracking/clock-in
// @access  Private (Employee only)
exports.clockIn = async (req, res) => {
  try {
    const { jobId, notes } = req.body;
    
    // Check if user already has an active time entry
    const activeEntry = await TimeEntry.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });
    
    if (activeEntry) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active time entry. Please clock out first.'
      });
    }
    
    // Verify job exists and user is assigned
    const job = await Job.findByPk(jobId, {
      include: [{
        model: User,
        as: 'assignedEmployees',
        attributes: ['id']
      }]
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const isAssigned = job.assignedEmployees.some(emp => emp.id === req.user.id);
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this job'
      });
    }
    
    // Create time entry
    const timeEntry = await TimeEntry.create({
      userId: req.user.id,
      jobId,
      clockIn: new Date(),
      notes,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      message: 'Clocked in successfully',
      timeEntry
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clock out
// @route   POST /api/time-tracking/clock-out
// @access  Private (Employee only)
exports.clockOut = async (req, res) => {
  try {
    const { breakMinutes = 0, notes } = req.body;
    
    // Find active time entry
    const timeEntry = await TimeEntry.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });
    
    if (!timeEntry) {
      return res.status(400).json({
        success: false,
        message: 'No active time entry found'
      });
    }
    
    // Calculate total hours
    const clockOut = new Date();
    const clockIn = new Date(timeEntry.clockIn);
    const totalMinutes = (clockOut - clockIn) / 1000 / 60; // Convert to minutes
    const workMinutes = totalMinutes - breakMinutes;
    const totalHours = Math.round(workMinutes / 60 * 100) / 100; // Round to 2 decimal places
    
    // Update time entry
    await timeEntry.update({
      clockOut,
      totalHours,
      breakMinutes,
      notes: notes || timeEntry.notes,
      status: 'completed'
    });
    
    // Update job's actual hours
    const job = await Job.findByPk(timeEntry.jobId);
    await job.update({
      actualHours: (job.actualHours || 0) + totalHours
    });
    
    res.json({
      success: true,
      message: 'Clocked out successfully',
      timeEntry: {
        ...timeEntry.toJSON(),
        totalHours
      }
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current status
// @route   GET /api/time-tracking/status
// @access  Private (Employee only)
exports.getStatus = async (req, res) => {
  try {
    const activeEntry = await TimeEntry.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'jobNumber', 'title']
      }]
    });
    
    res.json({
      success: true,
      isClockedIn: !!activeEntry,
      activeEntry
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get time entries
// @route   GET /api/time-tracking/entries
// @access  Private
exports.getTimeEntries = async (req, res) => {
  try {
    const { startDate, endDate, userId, jobId } = req.query;
    let where = {};
    
    // Filter by user (employees can only see their own)
    if (req.user.role === 'employee') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }
    
    // Filter by job
    if (jobId) {
      where.jobId = jobId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.clockIn = {};
      if (startDate) {
        where.clockIn[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.clockIn[Op.lte] = end;
      }
    }
    
    const entries = await TimeEntry.findAll({
      where,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobNumber', 'title']
        }
      ],
      order: [['clockIn', 'DESC']]
    });
    
    // Calculate totals
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    
    res.json({
      success: true,
      count: entries.length,
      totalHours: Math.round(totalHours * 100) / 100,
      entries
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve time entry
// @route   PUT /api/time-tracking/entries/:id/approve
// @access  Private (Owner only)
exports.approveTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findByPk(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }
    
    if (timeEntry.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve completed time entries'
      });
    }
    
    await timeEntry.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Time entry approved',
      timeEntry
    });
  } catch (error) {
    console.error('Approve time entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};