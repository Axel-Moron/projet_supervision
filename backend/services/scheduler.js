import cron from "node-cron";
import Variable from "../models/Variable.js";
import { readVariable } from "./modbusService.js";

// Stockage des tâches actives : { variableId: cronTask }
const tasks = {};

// Démarrer une tâche pour une variable
export const startTask = (variable) => {
    // Si une tâche existe déjà, on l'arrête d'abord
    if (tasks[variable.id]) {
        tasks[variable.id].stop();
        delete tasks[variable.id];
    }

    if (!variable.actif) return; // Si désactivée, on ne lance rien

    // Conversion fréquence (sec) en syntaxe cron
    // Note: node-cron gère les secondes. "*/5 * * * * *" = toutes les 5 secondes
    const freq = variable.frequence || 5;
    const cronExpression = `*/${freq} * * * * *`;

    console.log(`⏰ Tâche démarrée pour ${variable.nom} (ID: ${variable.id}) - Freq: ${freq}s`);

    const task = cron.schedule(cronExpression, async () => {
        await readVariable(variable);
    });

    tasks[variable.id] = task;
};

// Arrêter une tâche
export const stopTask = (variableId) => {
    if (tasks[variableId]) {
        tasks[variableId].stop();
        delete tasks[variableId];
        console.log(`🛑 Tâche arrêtée pour ID: ${variableId}`);
    }
};

// Rafraîchir TOUTES les tâches (au démarrage)
export const initScheduler = async () => {
    console.log("🔄 Initialisation du Scheduler...");
    // Arrêter tout ce qui pourrait traîner
    Object.keys(tasks).forEach(id => stopTask(id));

    const variables = await Variable.findAll();
    variables.forEach(v => startTask(v));
    console.log(`✅ Scheduler initialisé avec ${variables.length} variables.`);
};

// Rafraîchir une variable spécifique (après modif)
export const refreshVariableTask = async (variableId) => {
    const variable = await Variable.findByPk(variableId);
    if (variable) {
        startTask(variable);
    } else {
        stopTask(variableId); // Si elle n'existe plus (supprimée)
    }
};
