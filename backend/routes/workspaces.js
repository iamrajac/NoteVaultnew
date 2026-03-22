const express = require('express');
const router = express.Router();
const workspacesController = require('../controllers/workspaces');

// Get members for a specific workspace
router.get('/:workspaceId/members', workspacesController.getWorkspaceMembers);

module.exports = router;
