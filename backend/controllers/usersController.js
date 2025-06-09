const bcrypt = require('bcrypt');
const User = require('../models/user');
// Optional: If you plan to use JWT for authentication
// const jwt = require('jsonwebtoken');
// const config = require('../config/config'); // Assuming you have a config file for JWT secret

exports.register = async (req, res, next) => {
  try {
  
   console.log("called");
   
    const { name, email, password } = req.body;
    console.log({name, email, password})
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    // Simple email regex
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Optional: Generate a JWT token
    // const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } /*, token*/ });
  } catch (err) {
    next(err);
  }
}; 