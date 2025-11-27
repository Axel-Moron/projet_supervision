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

router.post("/variables", async (req, res) => {
    try {
        const newVar = await Variable.create(req.body);
        res.status(201).json(newVar);
    } catch (err) { res.status(400).json({ error: err.message }); }
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