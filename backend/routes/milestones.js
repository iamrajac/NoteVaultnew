const express = require('express');
const router = express.Router();
const milestonesController = require('../controllers/milestones');

router.post('/', milestonesController.createMilestone);
router.get('/project/:projectId', milestonesController.getProjectMilestones);
router.get('/workspace/:workspaceId', milestonesController.getWorkspaceMilestones);
router.patch('/:id/status', milestonesController.updateMilestoneStatus);

module.exports = router;
