const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const allowedRoles = ['Admin', 'Team Lead', 'Employee'];
    const userRole = allowedRoles.includes(role) ? role : 'Employee'; // Default to Employee

    // Create user and a default personal workspace
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        workspaces: {
          create: {
            role: userRole,
            workspace: {
              create: {
                name: `${name || email}'s Workspace`,
                colorTheme: 'blue'
              }
            }
          }
        }
      },
      include: {
        workspaces: {
          include: { workspace: true }
        }
      }
    });

    // Optionally set their chosen role in the new workspace if they chose Team Lead/Employee? 
    // Usually, creating a workspace makes you the Admin. We'll leave it as Admin for now.

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaces: user.workspaces,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admins creating users and immediately associating them with the workspace
exports.inviteUser = async (req, res) => {
  try {
    const { adminUserId, adminRole, workspaceId, newEmail, newPassword, newName, newRole } = req.body;

    // RBAC: Only Admins can create new logins
    if (adminRole !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can invite new users to NoteVault.' });
    }

    if (!workspaceId || !newEmail || !newPassword || !newRole) {
      return res.status(400).json({ error: 'Missing req fields (newEmail, newPassword, newRole, workspaceId)' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Create NoteVault user
    const newUser = await prisma.user.create({
      data: {
        email: newEmail,
        password: hashedPassword,
        name: newName,
        workspaces: {
          create: {
            workspaceId: workspaceId,
            role: newRole // Assign them Admin, Team Lead, or Employee role specifically in this workspace
          }
        }
      }
    });

    res.status(201).json({ message: 'User created and invited successfully', invitedUserId: newUser.id });
  } catch (error) {
    console.error('Invite Admin Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const allowedRoles = ['Admin', 'Team Lead', 'Employee'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'A valid role (Admin, Team Lead, Employee) is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: { workspace: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const userRole = role || 'Employee';

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaces: user.workspaces,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // To avoid leaking which emails exist, respond with success either way
    if (!user) {
      return res.json({ message: 'If an account exists for this email, a reset instruction has been generated.' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8-char temp password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // In a real app we would email this temp password; for now we return it for dev/testing
    return res.json({
      message: 'Temporary password generated successfully. Use it to log in and then change your password.',
      tempPassword
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.registerWithInvite = async (req, res) => {
  try {
    const { token, email, password, name } = req.body;
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    const { projectId, workspaceId } = decoded;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use. Log in directly instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 1. Create User & associate with Workspace as 'Employee'
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        workspaces: {
          create: {
            workspaceId: workspaceId,
            role: 'Employee' // Invites default to Employee Role, making them only capable of updating tasks
          }
        }
      }
    });

    // 2. Add them explicitly to the Project
    await prisma.projectMember.create({
        data: {
            projectId,
            userId: newUser.id
        }
    });

    const authToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'Joined NoteVault workspace and project successfully', 
      token: authToken, 
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'Employee',
        workspaces: [{ workspaceId, role: 'Employee' }]
      }
    });
  } catch (error) {
    console.error('Invite Register Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
