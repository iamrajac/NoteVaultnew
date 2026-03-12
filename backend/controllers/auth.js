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
        role: userRole,
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
    const userRole = user.role || 'Employee';

    if (role !== userRole) {
      return res.status(403).json({ error: `You are registered as ${userRole}. Please log in as ${userRole}.` });
    }

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
