const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');

// Create a new note
router.post('/', notesController.createNote);

// Get all notes for a specific project
router.get('/project/:projectId', notesController.getProjectNotes);

// Get a single note by ID
router.get('/:id', notesController.getNoteById);

// Update a note (content/title/status/tag updates)
router.patch('/:id', notesController.updateNote);

// Update note status (Approval Workflow)
router.patch('/:id/status', notesController.updateNoteStatus);

module.exports = router;
