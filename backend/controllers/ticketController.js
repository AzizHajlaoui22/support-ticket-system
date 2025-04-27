const Ticket = require('../models/Ticket');
const { sendTicketStatusUpdateEmail } = require('../services/emailService');
const User = require('../models/User');
// Créer un ticket
const createTicket = async (req, res) => {
  const { title, description } = req.body;

  try {
    const ticket = await Ticket.create({
      title,
      description,
      createdBy: req.user.id // 🔥 On prend l'utilisateur connecté grâce à protect
    });
    // 🔥 Ajout du log ici
    console.log('📧 Email pour notification création ticket:', req.user.email);
    await sendTicketStatusUpdateEmail(req.user.email, ticket._id, 'created');


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
      await sendTicketStatusUpdateEmail(req.body.agentEmail, ticket._id, 'assigned');
      await sendTicketStatusUpdateEmail(req.body.agentEmail, ticket._id, 'assigned');


  
      res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  // Mettre à jour un ticket
const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
  
    try {
      const ticket = await Ticket.findById(id);
  
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      // Optionnel : Vérifier si c'est le créateur ou l'agent assigné qui modifie sauf admin
      if (
        ticket.createdBy.toString() !== req.user.id &&
        ticket.assignedTo?.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to update this ticket' });
      }
  
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      // ✅ récupérer l'utilisateur pour avoir son email
    const creator = await User.findById(ticket.createdBy);

    if (creator && creator.email) {
      await sendTicketStatusUpdateEmail(creator.email, ticket._id, 'updated');
    } else {
      console.error('Créateur non trouvé ou sans email');
    }
      await ticket.save();
      res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  // Clôturer un ticket
const closeTicket = async (req, res) => {
    const { id } = req.params;
  
    try {
      const ticket = await Ticket.findById(id);
  
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      // Vérifier si c'est le créateur ou l'agent assigné qui clôture sauf admin
      if (
        ticket.createdBy.toString() !== req.user.id &&
        ticket.assignedTo?.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to close this ticket' });
      }
  
      ticket.status = 'closed';
      await ticket.save();
      const creator = await User.findById(ticket.createdBy);

    if (creator && creator.email) {
      await sendTicketStatusUpdateEmail(creator.email, ticket._id, 'closed');
    } else {
      console.error('Créateur non trouvé ou sans email');
    }

      res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = {
    createTicket,
    getMyTickets,
    assignTicket,
    updateTicket,
    closeTicket
  };
  