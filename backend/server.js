import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from "express-session";
import sequelize from "./config/db.js";

// Modèles
import Variable from "./models/Variable.js";
import Mesure from "./models/Mesure.js";
import User from "./models/User.js";

// Routes
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

const app = express();

// 1. Configuration CORS (Important pour que le login marche !)
app.use(cors({
    origin: true, // Accepte toutes les origines (pour le dév)
    credentials: true // Autorise l'envoi des cookies/sessions
}));

app.use(express.json());

// 2. Configuration des Sessions
app.use(session({
    secret: "secret_supervision_key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // false car on est en HTTP (pas HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24h
    }
}));

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

// --- SIMULATION MODBUS ---
const simulerAutomates = async () => {
    try {
        const variables = await Variable.findAll({ where: { actif: true } });
        const now = new Date();
        variables.forEach(async (v) => {
            let randomValue = (Math.random() * 100).toFixed(2);
            await Mesure.create({
                variable_id: v.id,
                valeur: randomValue,
                timestamp: now
            });
        });
        // console.log(`[SIMULATION] Données générées.`);
    } catch (error) {
        console.error("Erreur simulation:", error);
    }
};
setInterval(simulerAutomates, 5000);

// --- DÉMARRAGE ET SEEDING ---
await sequelize.sync({ force: false });

// Création de l'admin par défaut s'il n'existe pas
const adminExists = await User.findOne({ where: { username: "admin" } });
if (!adminExists) {
    await User.create({ username: "admin", password: "1234" }); // Mot de passe du TP
    console.log("👤 Utilisateur 'admin' créé (mdp: 1234)");
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});