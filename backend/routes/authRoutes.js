const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Route pour s'inscrire
router.post('/register', registerUser);

// Route pour se connecter
router.post('/login', loginUser);

module.exports = router;
