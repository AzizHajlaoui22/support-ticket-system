const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ Ajoute cette ligne

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base MongoDB
connectDB();

// Création de l'app Express
const app = express();

// ✅ Ajoute CORS ici après avoir créé `app`
app.use(cors());

// Middlewares
app.use(express.json());

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// Middleware global de gestion des erreurs — À placer tout à la fin !
app.use(errorHandler);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));