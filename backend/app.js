const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base MongoDB
connectDB();

// Création de l'app Express
const app = express();

// Middlewares
app.use(express.json());

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
