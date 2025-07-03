const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAssignedTickets,
  assignTicket,
  updateTicket,
  closeTicket,
  getAllTickets,
  getTicketById,
  deleteTicket
} = require('../controllers/ticketController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Créer un ticket
router.post('/', protect, authorizeRoles('user'), createTicket);

//  les routes spécifiques
router.get('/my', protect, getMyTickets);
router.get('/assigned', protect, getAssignedTickets);
router.get('/all', protect, authorizeRoles('admin', 'agent'), getAllTickets);

// Ensuite les routes dynamiques
router.get('/:id', protect, getTicketById);
router.put('/:id/assign', protect, authorizeRoles('admin'), assignTicket);
//router.put('/:id', protect, updateTicket);
router.put('/:id/close',  authorizeRoles('admin', 'agent') , protect, closeTicket);
router.delete('/:id', protect, authorizeRoles('admin'), deleteTicket);

module.exports = router;
