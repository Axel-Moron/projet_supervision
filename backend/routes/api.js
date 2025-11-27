import express from "express";
import Variable from "../models/Variable.js";
import Mesure from "../models/Mesure.js";

const router = express.Router();

// --- GESTION DES VARIABLES (Pour config.html) ---

// Récupérer toutes les variables
router.get("/variables", async (req, res) => {
    try {
        const vars = await Variable.findAll();
        res.json(vars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter une variable
router.post("/variables", async (req, res) => {
    try {
        const newVar = await Variable.create(req.body);
        res.status(201).json(newVar);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Supprimer une variable
router.delete("/variables/:id", async (req, res) => {
    try {
        await Variable.destroy({ where: { id: req.params.id } });
        res.json({ message: "Supprimé" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUPERVISION (Pour index.html) ---

// Récupérer la dernière mesure pour chaque variable active
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;