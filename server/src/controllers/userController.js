const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');


exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email
    } = req.body;

    const existingUser = await User.findOne({
      where: {
        username
      }
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists'
      });
    }

    const existingEmail = await User.findOne({
      where: {
        email
      }
    });
    if (existingEmail) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.toString()
    });
  }
};

exports.updateGamesWithUserId = async (userId) => {
  try {
    await Game.update({
      userId: userId
    }, {
      where: {
        userId: null
      }
    });
  } catch (error) {
    console.error('Error updating games with user ID:', error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.toString() });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // The user object is attached to the request by the authMiddleware
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'firstName', 'lastName', 'email']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token', error: error.toString() });
  }
};