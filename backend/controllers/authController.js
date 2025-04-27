const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Générer un token JWT
const generateToken = ({ _id, role }) =>
  jwt.sign({ id: _id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

// Inscription
const registerUser = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ ...user.toObject(), token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Connexion
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ ...user.toObject(), token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };
