const Ticket = require('../models/Ticket');

// Créer un ticket
const createTicket = async (req, res) => {
  const { title, description } = req.body;

  try {
    const ticket = await Ticket.create({
      title,
      description,
      createdBy: req.user.id // 🔥 On prend l'utilisateur connecté grâce à protect
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }  // ✅ ici on ferme la fonction createTicket correctement
};

// Récupérer tous les tickets créés par l'utilisateur connecté
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id });
    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }  
};

// Assigner un ticket à un agent
const assignTicket = async (req, res) => {
    const { id } = req.params; // ID du ticket
    const { agentId } = req.body; // ID de l'agent qu'on veut assigner
  
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      ticket.assignedTo = agentId;
      ticket.status = 'assigned'; // Optionnel : on change aussi le statut
      await ticket.save();
  
      res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = { createTicket, getMyTickets, assignTicket };