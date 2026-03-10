const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    const userRole = role || 'Employee'; // Default to Employee

    // Create user and a default personal workspace
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        workspaces: {
          create: {
            role: 'Admin', // Always admin of their default personal workspace
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
        role: userRole
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
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
        role: userRole // Note: The UI provided just switches a UI state, but eventually role might need real validation
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
