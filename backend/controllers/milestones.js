const prisma = require('../utils/db');

exports.createMilestone = async (req, res) => {
  try {
    const { name, description, dueDate, projectId } = req.body;
    
    if (!name || !projectId) {
      return res.status(400).json({ error: "Name and projectId are required." });
    }

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        status: "Active"
      }
    });

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Create Milestone Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' }
    });

    res.json(milestones);
  } catch (error) {
    console.error('Fetch Milestones Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getWorkspaceMilestones = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const milestones = await prisma.milestone.findMany({
      where: { project: { workspaceId } },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(milestones);
  } catch (error) {
    console.error('Fetch Workspace Milestones Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await prisma.milestone.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update Milestone Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
