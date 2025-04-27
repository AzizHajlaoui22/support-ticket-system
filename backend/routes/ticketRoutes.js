const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, assignTicket } = require('../controllers/ticketController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');


// Créer un ticket
router.post('/', protect, createTicket);

// Voir ses propres tickets
router.get('/my', protect, getMyTickets);

// Assigner un ticket à un agent (admin uniquement)
router.put('/:id/assign', protect, authorizeRoles('admin'), assignTicket);

module.exports = router;
