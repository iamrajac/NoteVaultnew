const express = require('express');
const router = express.Router();
const workspacesController = require('../controllers/workspaces');

// Get members for a specific workspace
router.get('/:workspaceId/members', workspacesController.getWorkspaceMembers);
router.get('/:workspaceId/graph', workspacesController.getKnowledgeGraph);
router.get('/:workspaceId/changelog', workspacesController.getChangelog);

module.exports = router;
