const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');

// Get all workspace projects
router.get('/:workspaceId', projectsController.getWorkspaceProjects);

// Create a new project (Admin/Team Lead only)
router.post('/', projectsController.createProject);

// Add a member to a project
router.post('/:projectId/members', projectsController.addProjectMember);

// Generate an invite link for a project
router.post('/:projectId/invite-link', projectsController.generateInviteLink);

module.exports = router;
