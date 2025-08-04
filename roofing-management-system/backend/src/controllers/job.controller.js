const { Job, Customer, User, TimeEntry, Photo, Document } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    let where = {};
    
    // If user is employee, only show assigned jobs
    if (req.user.role === 'employee') {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Job,
          as: 'assignedJobs',
          attributes: ['id']
        }]
      });
      const jobIds = user.assignedJobs.map(job => job.id);
      where.id = { [Op.in]: jobIds };
    }
    // If user is customer, only show their jobs
    else if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { userId: req.user.id } });
      if (customer) {
        where.customerId = customer.id;
      }
    }
    
    // Add status filter if provided
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    const jobs = await Job.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedEmployees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'assignedEmployees',
          attributes: ['id', 'name', 'email', 'phone'],
          through: { attributes: [] }
        },
        {
          model: TimeEntry,
          as: 'timeEntries',
          include: [{
            model: User,
            as: 'employee',
            attributes: ['name']
          }]
        }
      ]
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check access rights
    if (req.user.role === 'employee') {
      const isAssigned = job.assignedEmployees.some(emp => emp.id === req.user.id);
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this job'
        });
      }
    } else if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { userId: req.user.id } });
      if (!customer || job.customerId !== customer.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this job'
        });
      }
    }
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Owner only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      customerId,
      address,
      startDate,
      endDate,
      estimatedHours,
      estimatedCost,
      priority,
      assignedEmployees
    } = req.body;
    
    // Generate job number
    const jobCount = await Job.count();
    const jobNumber = `JOB-${String(jobCount + 1).padStart(3, '0')}`;
    
    // Create job
    const job = await Job.create({
      jobNumber,
      title,
      description,
      customerId,
      address,
      startDate,
      endDate,
      estimatedHours,
      estimatedCost,
      priority: priority || 'medium',
      status: 'pending',
      createdBy: req.user.id
    });
    
    // Assign employees if provided
    if (assignedEmployees && assignedEmployees.length > 0) {
      await job.setAssignedEmployees(assignedEmployees);
    }
    
    // Reload with associations
    const newJob = await Job.findByPk(job.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedEmployees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Owner only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Update fields
    const {
      title,
      description,
      status,
      priority,
      address,
      startDate,
      endDate,
      estimatedHours,
      estimatedCost,
      actualHours,
      actualCost,
      assignedEmployees
    } = req.body;
    
    await job.update({
      title: title || job.title,
      description: description || job.description,
      status: status || job.status,
      priority: priority || job.priority,
      address: address || job.address,
      startDate: startDate || job.startDate,
      endDate: endDate || job.endDate,
      estimatedHours: estimatedHours || job.estimatedHours,
      estimatedCost: estimatedCost || job.estimatedCost,
      actualHours: actualHours !== undefined ? actualHours : job.actualHours,
      actualCost: actualCost !== undefined ? actualCost : job.actualCost
    });
    
    // Update assigned employees if provided
    if (assignedEmployees) {
      await job.setAssignedEmployees(assignedEmployees);
    }
    
    // Reload with associations
    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedEmployees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    await job.destroy();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private
exports.getJobStats = async (req, res) => {
  try {
    const stats = {};
    
    if (req.user.role === 'owner') {
      // Get all jobs count by status
      stats.total = await Job.count();
      stats.pending = await Job.count({ where: { status: 'pending' } });
      stats.active = await Job.count({ where: { status: 'active' } });
      stats.completed = await Job.count({ where: { status: 'completed' } });
      stats.cancelled = await Job.count({ where: { status: 'cancelled' } });
      
      // Get this month's jobs
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      stats.thisMonth = await Job.count({
        where: {
          createdAt: { [Op.gte]: startOfMonth }
        }
      });
    } else if (req.user.role === 'employee') {
      // Get employee's assigned jobs stats
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Job,
          as: 'assignedJobs'
        }]
      });
      
      stats.total = user.assignedJobs.length;
      stats.active = user.assignedJobs.filter(j => j.status === 'active').length;
      stats.completed = user.assignedJobs.filter(j => j.status === 'completed').length;
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};