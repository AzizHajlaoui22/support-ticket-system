const express = require('express');
const router = express.Router();
const { getUsersByRole } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Route protégée pour récupérer les utilisateurs avec un rôle spécifique
// Par exemple : GET /api/users?role=agent
router.get('/', protect, authorizeRoles('admin'), getUsersByRole);

module.exports = router;
