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

module.exports = { createTicket, getMyTickets };
