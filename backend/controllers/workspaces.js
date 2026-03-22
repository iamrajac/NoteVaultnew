const prisma = require('../utils/db');

// Get all members of a workspace
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Fetch Workspace Members Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
