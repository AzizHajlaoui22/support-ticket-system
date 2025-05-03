// controllers/userController.js
const User = require('../models/User'); // adapte si besoin

const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('_id name email role');
    res.json(users);
  } catch (error) {
    console.error("Erreur getUsersByRole:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getUsersByRole, // ✅ assure-toi que cette ligne existe
};
