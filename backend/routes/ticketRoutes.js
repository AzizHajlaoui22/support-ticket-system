const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets } = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');

// Créer un ticket
router.post('/', protect, createTicket);

// Voir ses propres tickets
router.get('/my', protect, getMyTickets);

module.exports = router;
