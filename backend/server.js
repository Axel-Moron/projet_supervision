/**
 * Serveur Express pour l'application de contrôle qualité
 * Gère l'API REST pour la traçabilité des cartes électroniques
 */

// Charger les variables d'environnement depuis le fichier .env
import 'dotenv/config';

import express from "express";
import sequelize from "./config/db.js";
import "./models/Operateur.js";
import "./models/Piece.js";
import Test from "./models/Test.js";
import "./models/Resultat.js";

import pieceRoutes from "./routes/pieces.js";
import operateurRoutes from "./routes/operateur.js";
import resultatsRoutes from "./routes/resultats.js";
import testsRoutes from "./routes/tests.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import session from "express-session";

const app = express();

// Configuration CORS avec credentials pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: true, // Permet toutes les origines (ou spécifiez votre frontend)
  credentials: true
}));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configuration des sessions pour l'authentification des opérateurs
app.use(session({
  secret: "controle-qualite-secret-key-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en production avec HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Routes d'authentification (publiques - pas de middleware d'auth requis)
app.use("/api/auth", authRoutes);

// Routes protégées nécessitant une authentification
app.use("/api/pieces", pieceRoutes);
app.use("/api/operateur", operateurRoutes);
app.use("/api/resultats", resultatsRoutes);
app.use("/api/tests", testsRoutes);

// Synchronisation de la base de données avec les modèles Sequelize
await sequelize.sync({ alter: false });

/**
 * Initialise les tests prédéfinis dans la base de données
 * Crée les 3 tests de base si aucun test n'existe déjà
 */
async function seedTests() {
  try {
    const existingTests = await Test.findAll();
    
    if (existingTests.length === 0) {
      console.log("📋 Initialisation des 3 tests prédéfinis...");
      
      // Test de connectivité (boolean: conforme/non conforme)
      await Test.create({
        nom_test: "Connectivité des circuits",
        type_test: "boolean",
        seuil_min: null,
        seuil_max: null
      });
      
      // Test thermique (numeric: température entre 0 et 80°C)
      await Test.create({
        nom_test: "Fonctionnement thermique",
        type_test: "numeric",
        seuil_min: 0,
        seuil_max: 80
      });
      
      // Test firmware (checkbox: conforme si coché)
      await Test.create({
        nom_test: "Mise à jour du firmware",
        type_test: "checkbox",
        seuil_min: null,
        seuil_max: null
      });
      
      console.log("✅ 3 tests créés avec succès !");
    } else {
      console.log(`ℹ️  ${existingTests.length} test(s) déjà présent(s) dans la base de données.`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du seed des tests:", error);
  }
}

await seedTests();

// Démarrage
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveur backend🧠 démarré🎯 sur http://localhost:${PORT}🌐`));
