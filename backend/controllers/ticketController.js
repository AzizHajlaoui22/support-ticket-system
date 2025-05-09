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
    const tickets = await Ticket.find({ createdBy: req.user.id })
    .populate('assignedTo', 'name email role');
    
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }  
};
// Récupérer tous les tickets assignés à l'utilisateur connecté
const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user.id })
      .populate('assignedTo', 'name email role')   // Pour afficher qui est assigné
      .populate('createdBy', 'name email role');   // Optionnel : pour afficher qui a créé le ticket

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
  const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
  
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      const isCreator = ticket.createdBy.toString() === req.user.id;
      const isAssignedToMe = ticket.assignedTo?.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
  
      // 🌐 Logique de droits :
      if (isAdmin) {
        // ✅ admin peut tout faire
      } else if (req.user.role === 'user') {
        // ❌ si le ticket est fermé ou assigné, l'user ne peut plus le modifier
        if (!isCreator || ticket.status === 'closed' || ticket.assignedTo) {
          return res.status(403).json({ message: 'Accès refusé : vous ne pouvez plus modifier ce ticket.' });
        }
      } else if (req.user.role === 'agent') {
        if (!isAssignedToMe) {
          return res.status(403).json({ message: 'Accès refusé : vous n\'êtes pas assigné à ce ticket.' });
        }
      } // ✅ FIN DU else if
       
      // ✏️ Appliquer les modifications
      if (title) ticket.title = title;
      if (description) ticket.description = description;
  
      const creator = await User.findById(ticket.createdBy);
      if (creator?.email) {
        await sendTicketStatusUpdateEmail(creator.email, ticket._id, ticket.status);
      }
  
      await ticket.save();
      res.status(200).json(ticket);
  
    } catch (error) {
      console.error("Erreur updateTicket:", error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };  
  // supprimer un ticket par admin 
  const deleteTicket = async (req, res) => {
    const { id } = req.params;
  
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      // Seul un administrateur peut supprimer un ticket
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Seul un administrateur peut supprimer un ticket.' });
      }
  
      await ticket.deleteOne(); // ou ticket.remove() si tu utilises Mongoose < 6
      res.status(200).json({ message: 'Ticket supprimé avec succès.' });
    } catch (error) {
      console.error("Erreur deleteTicket:", error);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
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
        //ticket.createdBy.toString() !== req.user.id &&
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
  const getTicketById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const ticket = await Ticket.findById(id).populate('createdBy assignedTo', 'name email role');
  
      if (!ticket) {
        const error = new Error('Ticket not found');
        error.statusCode = 404;
        return next(error);
      }
  
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    createTicket,
    getMyTickets,
    getAssignedTickets,
    assignTicket,
    updateTicket,
    closeTicket,
    getAllTickets,
    getTicketById,
    deleteTicket

  };
  