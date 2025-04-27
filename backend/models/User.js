const mongoose = require('mongoose'); // 👈 IMPORT mongoose

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'agent', 'admin'] },
});

module.exports = mongoose.model('User', UserSchema);
