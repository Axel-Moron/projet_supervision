import express from "express";
import { Op } from "sequelize"; // Important pour les filtres de dates
import Variable from "../models/Variable.js";
import Mesure from "../models/Mesure.js";

const router = express.Router();

// --- GESTION DES VARIABLES ---
router.get("/variables", async (req, res) => {
    try {
        const vars = await Variable.findAll();
        res.json(vars);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Route pour CRÉER une nouvelle variable
router.post("/variables", async (req, res) => {
    try {
        // On récupère tous les champs, y compris les nouveaux (decimals, unit)
        const { nom, ip_automate, registre, type, frequence, actif, decimals, unit } = req.body;

        // On crée la variable avec toutes ces infos
        const variable = await Variable.create({
            nom,
            ip_automate,
            registre,
            type,
            frequence,
            actif,
            decimals: decimals || 0, // Valeur par défaut si non fourni
            unit: unit || ""         // Valeur par défaut si non fourni
        });

        res.json(variable);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.delete("/variables/:id", async (req, res) => {
    try {
        await Variable.destroy({ where: { id: req.params.id } });
        res.json({ message: "Supprimé" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SUPERVISION (Dashboard) ---
router.get("/dashboard", async (req, res) => {
    try {
        const variables = await Variable.findAll({ where: { actif: true } });
        const dashboardData = [];

        for (const v of variables) {
            const lastMesure = await Mesure.findOne({
                where: { variable_id: v.id },
                order: [["timestamp", "DESC"]]
            });
            
            dashboardData.push({
                id: v.id,
                nom: v.nom,
                ip: v.ip_automate,
                registre: v.registre,
                frequence: v.frequence,
                valeur: lastMesure ? lastMesure.valeur : null,
                timestamp: lastMesure ? lastMesure.timestamp : null
            });
        }
        res.json(dashboardData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// Route pour MODIFIER une variable existante
router.put("/variables/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nom, ip_automate, registre, type, frequence, actif, decimals, unit } = req.body;

        const variable = await Variable.findByPk(id);
        if (!variable) {
            return res.status(404).json({ error: "Variable introuvable" });
        }

        // Mise à jour des champs
        variable.nom = nom;
        variable.ip_automate = ip_automate;
        variable.registre = registre;
        variable.type = type;
        variable.frequence = frequence;
        variable.actif = actif;
        variable.decimals = decimals;
        variable.unit = unit;

        await variable.save();
        res.json({ success: true, variable });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- HISTORIQUE (Nouvelle route !) ---
router.get("/history", async (req, res) => {
    try {
        const { variable_id, start, end } = req.query;
        const whereClause = {};

        // Filtre par variable (si sélectionnée)
        if (variable_id) {
            whereClause.variable_id = variable_id;
        }

        // Filtre par date
        if (start && end) {
            // On ajoute les heures pour couvrir toute la journée
            const startDate = new Date(start);
            startDate.setHours(0,0,0,0);
            
            const endDate = new Date(end);
            endDate.setHours(23,59,59,999);

            whereClause.timestamp = {
                [Op.between]: [startDate, endDate]
            };
        }

        const mesures = await Mesure.findAll({
            where: whereClause,
            include: [{ model: Variable, attributes: ['nom'] }], // Inclure le nom de la variable
            order: [["timestamp", "DESC"]],
            limit: 500 // Limite pour éviter de faire exploser le navigateur
        });

        res.json(mesures);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;