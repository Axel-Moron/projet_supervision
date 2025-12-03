import express from "express";
import { Op } from "sequelize";
import Variable from "../models/Variable.js";
import Mesure from "../models/Mesure.js";
import { refreshVariableTask, stopTask } from "../services/scheduler.js";

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
        const { nom, ip_automate, registre, type, frequence, actif, decimals, unit, seuil_min, seuil_max } = req.body;

        const variable = await Variable.create({
            nom,
            ip_automate,
            registre,
            type,
            frequence,
            actif,
            decimals: decimals || 0,
            unit: unit || "",
            seuil_min: seuil_min !== "" ? seuil_min : null,
            seuil_max: seuil_max !== "" ? seuil_max : null
        });

        // Démarrage de la tâche
        await refreshVariableTask(variable.id);

        res.json(variable);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete("/variables/:id", async (req, res) => {
    try {
        await Variable.destroy({ where: { id: req.params.id } });
        stopTask(req.params.id); // Arrêt de la tâche
        res.json({ message: "Supprimé" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Route pour MODIFIER une variable existante
router.put("/variables/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nom, ip_automate, registre, type, frequence, actif, decimals, unit, seuil_min, seuil_max } = req.body;

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
        variable.seuil_min = (seuil_min !== "") ? seuil_min : null;
        variable.seuil_max = (seuil_max !== "") ? seuil_max : null;

        await variable.save();

        // Mise à jour de la tâche planifiée
        await refreshVariableTask(variable.id);

        res.json({ success: true, variable });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
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
                type: v.type,
                decimals: v.decimals,
                unit: v.unit,
                seuil_min: v.seuil_min,
                seuil_max: v.seuil_max,
                valeur: lastMesure ? lastMesure.valeur : null,
                timestamp: lastMesure ? lastMesure.timestamp : null
            });
        }
        res.json(dashboardData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- HISTORIQUE ---
router.get("/history", async (req, res) => {
    try {
        const { variable_id, start, end } = req.query;
        const whereClause = {};

        if (variable_id) {
            if (variable_id.includes(',')) {
                whereClause.variable_id = { [Op.in]: variable_id.split(',') };
            } else {
                whereClause.variable_id = variable_id;
            }
        }

        if (start && end) {
            // Si le format inclut "T" (ISO), on garde l'heure exacte, sinon on prend la journée entière
            const startDate = start.includes('T') ? new Date(start) : new Date(start);
            if (!start.includes('T')) startDate.setHours(0, 0, 0, 0);

            const endDate = end.includes('T') ? new Date(end) : new Date(end);
            if (!end.includes('T')) endDate.setHours(23, 59, 59, 999);

            whereClause.timestamp = {
                [Op.between]: [startDate, endDate]
            };
        }

        const mesures = await Mesure.findAll({
            where: whereClause,
            include: [{ model: Variable, attributes: ['nom', 'type', 'seuil_min', 'seuil_max', 'unit'] }],
            order: [["timestamp", "ASC"]], // Ordre chrono pour le graph
            limit: 2000 // Augmenté pour les graphs
        });

        res.json(mesures);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- EXPORT CSV ---
router.get("/export", async (req, res) => {
    try {
        const { variable_id, start, end } = req.query;
        const whereClause = {};

        if (variable_id) {
            if (variable_id.includes(',')) {
                whereClause.variable_id = { [Op.in]: variable_id.split(',') };
            } else {
                whereClause.variable_id = variable_id;
            }
        }

        if (start && end) {
            const startDate = start.includes('T') ? new Date(start) : new Date(start);
            if (!start.includes('T')) startDate.setHours(0, 0, 0, 0);

            const endDate = end.includes('T') ? new Date(end) : new Date(end);
            if (!end.includes('T')) endDate.setHours(23, 59, 59, 999);

            whereClause.timestamp = {
                [Op.between]: [startDate, endDate]
            };
        }

        const mesures = await Mesure.findAll({
            where: whereClause,
            include: [{ model: Variable, attributes: ['nom'] }],
            order: [["timestamp", "ASC"]]
        });

        // Génération du CSV
        let csv = "Date;Heure;Variable;Valeur\r\n";

        mesures.forEach(m => {
            const dateObj = new Date(m.timestamp);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString();
            const nom = m.Variable ? m.Variable.nom : "Inconnue";
            csv += `${date};${time};${nom};${m.valeur}\r\n`;
        });

        res.header("Content-Type", "text/csv");
        res.attachment("export_supervision.csv");
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de l'export");
    }
});

export default router;