import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from "express-session";
import mariadb from "mariadb"; 
import sequelize from "./config/db.js";

// Modèles
import Variable from "./models/Variable.js";
import Mesure from "./models/Mesure.js";
import User from "./models/User.js";

// Routes
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

const app = express();

// --- 1. CONFIGURATION AUTOMATIQUE DE LA BDD ---
async function autoConfigDB() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || "127.0.0.1",
            user: "root",
            password: "admin" 
        });

        console.log("🔧 Configuration de la base 'supervision'...");

        // CHANGEMENT ICI : On crée "supervision" au lieu de "qualite_db"
        await conn.query("CREATE DATABASE IF NOT EXISTS supervision");
        
        await conn.query("CREATE OR REPLACE USER 'db_user'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('strong_password')");
        
        // CHANGEMENT ICI : On donne les droits sur "supervision"
        await conn.query("GRANT ALL PRIVILEGES ON supervision.* TO 'db_user'@'localhost'");
        
        await conn.query("FLUSH PRIVILEGES");

        console.log("✅ Base de données 'supervision' prête !");
    } catch (err) {
        console.warn("⚠️ Erreur config auto (vérifie que XAMPP/MariaDB est lancé et le mot de passe root est bon).");
        console.error(err.message);
    } finally {
        if (conn) conn.end();
    }
}

// --- CONFIGURATION EXPRESS ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
    secret: "secret_supervision_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
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
            await Mesure.create({ variable_id: v.id, valeur: randomValue, timestamp: now });
        });
    } catch (error) {}
};
setInterval(simulerAutomates, 5000);

// --- DÉMARRAGE ---
await autoConfigDB(); // Lance la création de la base 'supervision'

try {
    await sequelize.sync({ force: false }); // Crée les tables dans 'supervision'
    
    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
        await User.create({ username: "admin", password: "1234" });
        console.log("👤 Utilisateur 'admin' créé");
    }

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("❌ Erreur démarrage :", error.message);
}