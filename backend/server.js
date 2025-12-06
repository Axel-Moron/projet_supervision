import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from "express-session";
import mariadb from "mariadb";
import sequelize from "./config/db.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Modèles
import Variable from "./models/Variable.js";
import Mesure from "./models/Mesure.js";
import User from "./models/User.js";

// Routes
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

// Services
import { initScheduler } from "./services/scheduler.js";
import { setSimulationMode, getSimulationMode } from "./services/modbusService.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function autoConfigDB() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || "127.0.0.1",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "admin"
        });
        await conn.query("CREATE DATABASE IF NOT EXISTS supervision");
        await conn.query("CREATE OR REPLACE USER 'db_user'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('strong_password')");
        await conn.query("GRANT ALL PRIVILEGES ON supervision.* TO 'db_user'@'localhost'");
        await conn.query("FLUSH PRIVILEGES");
    } catch (err) { console.error(err.message); }
    finally { if (conn) conn.end(); }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "secret_supervision_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// --- SERVIR LE FRONTEND ---
app.use(express.static(path.join(__dirname, '../frontend')));

app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

// --- ROUTE MODE SIMULATION ---
app.post("/api/mode", (req, res) => {
    const { simulation } = req.body;
    if (typeof simulation === 'boolean') {
        setSimulationMode(simulation);
        res.json({ success: true, mode: getSimulationMode() });
    } else {
        res.status(400).json({ error: "Valeur booléenne attendue" });
    }
});

app.get("/api/mode", (req, res) => {
    res.json({ mode: getSimulationMode() });
});

// --- DEMARRAGE ---
const startServer = async () => {
    await autoConfigDB();
    await sequelize.sync({ alter: true });

    // Création Admin par défaut
    const adminUser = await User.findOne({ where: { username: "admin" } });
    if (!adminUser) {
        await User.create({ username: "admin", password: process.env.ADMIN_PASSWORD || "1234", isAdmin: true });
        console.log("👤 Admin user created");
    } else if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log("👤 Admin user updated to have admin rights");
    }

    const PORT = process.env.PORT || 3000;
    // Démarrage du Scheduler
    await initScheduler();

    app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
};
startServer();