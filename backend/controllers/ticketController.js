const Ticket = require('../models/Ticket');
const { sendTicketStatusUpdateEmail , sendTicketAssignedEmail} = require('../services/emailService');
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
     // 2. Récupérer l'email depuis la base de données via l'ID
     const user = await User.findById(req.user.id);
     ticket.status = 'open';

     // 3. Vérifier que l'utilisateur existe bien et a un email
     if (user && user.email) {
       console.log(`📧 Email pour notification création ticket: ${user.email}`);
       await sendTicketStatusUpdateEmail(user.email, ticket._id, ticket.status);
     } else {
       console.warn('⚠️ Utilisateur introuvable ou sans email');
     }

    res.status(201).json(ticket);
  } catch (error) {
     next(error);
  }  
};

// Récupérer tous les tickets créés par l'utilisateur connecté
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id });
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }  
};

// Assigner un ticket à un agent
const assignTicket = async (req, res) => {
    const { id } = req.params; // ID du ticket
    const { agentId } = req.body; // ID de l'agent qu'on veut assigner
  
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        const error = new Error('Ticket not found');
        error.statusCode = 404;
        return next(error);

      }
  
      ticket.assignedTo = agentId;
      ticket.status = 'assigned'; // Optionnel : on change aussi le statut
      await ticket.save();
      const creator = await User.findById(ticket.createdBy);
      if (creator && creator.email) {
        await sendTicketStatusUpdateEmail(creator.email, ticket._id, ticket.status);
      } else {
        console.error('Créateur non trouvé ou sans email');
      }
      // 2. Récupérer l'email depuis la base de données via l'ID
     const Agent = await User.findById(agentId);

     const sender = await User.findById(req.user.id); // 👈 Ajout ici
     const senderName = sender.name;
     const senderRole = sender.role;

     if (Agent && Agent.email) {
      console.log(`📧 Email d'agent pour notification création ticket: ${Agent.email}`);
      await sendTicketAssignedEmail(Agent.email, ticket._id,senderName, senderRole );
    } else {
      console.warn('⚠️ agent introuvable ou sans email');
    }
     

      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };
  // Mettre à jour un ticket
const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
  
    try {
      const ticket = await Ticket.findById(id);
  
      if (!ticket) {
        const error = new Error('Ticket not found');
        error.statusCode = 404;
        return next(error);
      }
  
      // Optionnel : Vérifier si c'est le créateur ou l'agent assigné qui modifie sauf admin
      if (
        ticket.createdBy.toString() !== req.user.id &&
        ticket.assignedTo?.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        const error = new Error('Not authorized to update this ticket');
        error.statusCode = 403;
        return next(error);
      }
  
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      // ✅ récupérer l'utilisateur pour avoir son email
    const creator = await User.findById(ticket.createdBy);

    if (creator && creator.email) {
      ticket.status = 'updated';
      await sendTicketStatusUpdateEmail(creator.email, ticket._id, ticket.status);
    } else {
      console.error('Créateur non trouvé ou sans email');
    }
      await ticket.save();
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };
  // Clôturer un ticket
const closeTicket = async (req, res) => {
    const { id } = req.params;
  
    try {
      const ticket = await Ticket.findById(id);
  
      if (!ticket) {
        const error = new Error('Ticket not found');
        error.statusCode = 404;
        return next(error);
      }
  
      // Vérifier si c'est le créateur ou l'agent assigné qui clôture sauf admin
      if (
        ticket.createdBy.toString() !== req.user.id &&
        ticket.assignedTo?.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        const error = new Error('Not authorized to close this ticket');
        error.statusCode = 403;
        return next(error);
      }
  
      ticket.status = 'closed';
      await ticket.save();
      const creator = await User.findById(ticket.createdBy);

    if (creator && creator.email) {
      await sendTicketStatusUpdateEmail(creator.email, ticket._id, ticket.status);
    } else {
      console.error('Créateur non trouvé ou sans email');
    }

      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };
  const getAllTickets = async (req, res) => {
    try {
      const tickets = await Ticket.find().populate('createdBy assignedTo', 'name email role');
      res.status(200).json(tickets);
    } catch (error) {
      next(error);
    }
  };
  module.exports = {
    createTicket,
    getMyTickets,
    assignTicket,
    updateTicket,
    closeTicket,
    getAllTickets
  };
  