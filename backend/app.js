const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base MongoDB
connectDB();

const app = express();


// Middlewares globeaux
app.use(cors());
app.use(express.json());

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// Middleware global de gestion des erreurs
app.use(errorHandler);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));