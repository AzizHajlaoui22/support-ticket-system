const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, assignTicket, updateTicket, closeTicket, getAllTickets } = require('../controllers/ticketController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Créer un ticket
router.post('/', protect, createTicket);

// Voir ses propres tickets
router.get('/my', protect, getMyTickets);

// Assigner un ticket à un agent (admin uniquement)
router.put('/:id/assign', protect, authorizeRoles('admin'), assignTicket);

// Mettre à jour un ticket
router.put('/:id', protect, updateTicket);

// Clôturer un ticket
router.put('/:id/close', protect, closeTicket);

// ➔ Ta nouvelle route pour voir tous les tickets
router.get('/all', protect, authorizeRoles('admin', 'agent'), getAllTickets);

module.exports = router;
