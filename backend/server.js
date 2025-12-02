import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from "express-session";
import mariadb from "mariadb"; 
import sequelize from "./config/db.js";
import ModbusRTU from "modbus-serial"; // <--- NOUVEAU

// Modèles
import Variable from "./models/Variable.js";
import Mesure from "./models/Mesure.js";
import User from "./models/User.js";

// Routes
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

const app = express();

// --- VARIABLE GLOBALE D'ÉTAT ---
let MODE_SIMULATION = false; // Par défaut on simule pas

// Fonction pour faire une pause
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// ... (Configuration BDD autoConfigDB identique, je ne la remets pas pour raccourcir, garde la tienne) ...
// ... Si tu as besoin je peux la remettre, mais c'est la fonction autoConfigDB() d'avant ...
// Pour faire simple, copie-colle la fonction autoConfigDB() de ton ancien fichier ici.
async function autoConfigDB() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || "127.0.0.1",
            user: "root",
            password: "admin"
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
    secret: "secret_supervision_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

// --- NOUVELLE ROUTE POUR LE SWITCH ---
app.post("/api/mode", (req, res) => {
    const { simulation } = req.body;
    if (typeof simulation === 'boolean') {
        MODE_SIMULATION = simulation;
        console.log(`🔄 Mode changé : ${MODE_SIMULATION ? "SIMULATION" : "RÉEL"}`);
        res.json({ success: true, mode: MODE_SIMULATION });
    } else {
        res.status(400).json({ error: "Valeur booléenne attendue" });
    }
});
app.get("/api/mode", (req, res) => {
    res.json({ mode: MODE_SIMULATION });
});

// --- FONCTION LECTURE RÉELLE MODBUS CORRIGÉE ---
const lireModbusReel = async (variables) => {
    const now = new Date();
    
    for (const v of variables) {
        const client = new ModbusRTU();
        try {
            // Connexion (inchangée)
            await client.connectTCP(v.ip_automate, { port: 502 });
            client.setID(1);
            client.setTimeout(2000);

            const addr = parseInt(v.registre); 
            let val;

            // --- CORRECTION ICI ---
            if (v.type === "boolean") {
                // Lecture d'un COIL (Bit / %M)
                // Note: readCoils retourne un tableau de booléens [true, false...]
                const data = await client.readCoils(addr, 1);
                val = data.data[0] ? 1 : 0; // Conversion true/false en 1/0
                
            } else {
                // Lecture d'un REGISTER (Mot / %MW)
                const data = await client.readHoldingRegisters(addr, 1);
                val = data.data[0];
                val = val / 100; // Ton calcul pour les décimales
            }

            console.log(`✅ Succès ${v.nom} : ${val}`);
            await Mesure.create({ variable_id: v.id, valeur: val, timestamp: now });

        } catch (error) {
            if(error.code !== 'ETIMEDOUT') {
                console.error(`❌ Erreur Modbus sur ${v.ip_automate} (Var: ${v.nom}) :`, error.message);
            }
            
            await Mesure.create({ 
                variable_id: v.id, 
                valeur: -1, 
                timestamp: now 
            });

        } finally {
            try { await client.close(); } catch(e) {}
            // Pause pour éviter de saturer l'automate
            await sleep(500); 
        }
    }
};

// --- SIMULATION ---
const simulerAutomates = async (variables) => {
    const now = new Date();
    variables.forEach(async (v) => {
        let randomValue;
        if (v.type === "boolean") randomValue = Math.random() < 0.5 ? 0 : 1; 
        else randomValue = (Math.random() * 100).toFixed(2);

        await Mesure.create({ variable_id: v.id, valeur: randomValue, timestamp: now });
    });
};

// --- BOUCLE PRINCIPALE ---
setInterval(async () => {
    try {
        const variables = await Variable.findAll({ where: { actif: true } });
        
        if (MODE_SIMULATION) {
            await simulerAutomates(variables);
        } else {
            await lireModbusReel(variables);
        }
    } catch (e) { console.error(e); }
}, 5000);

// --- DEMARRAGE ---
const startServer = async () => {
    await autoConfigDB();
    await sequelize.sync({ force: false });
    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) await User.create({ username: "admin", password: "1234" });

    app.listen(3000, () => console.log(`🚀 Serveur démarré sur http://localhost:3000`));
};
startServer();