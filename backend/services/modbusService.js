import ModbusRTU from "modbus-serial";
import Mesure from "../models/Mesure.js";

// État global du mode
let MODE_SIMULATION = false;

// Fonction pour faire une pause
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const setSimulationMode = (isSimu) => {
    MODE_SIMULATION = isSimu;
    console.log(`🔄 Mode changé : ${MODE_SIMULATION ? "SIMULATION" : "RÉEL"}`);
};

export const getSimulationMode = () => MODE_SIMULATION;

// Lecture d'une SEULE variable (appelée par le Scheduler)
export const readVariable = async (variable) => {
    const now = new Date();

    if (MODE_SIMULATION) {
        // --- MODE SIMULATION ---
        let randomValue;
        if (variable.type === "boolean") randomValue = Math.random() < 0.5 ? 0 : 1;
        else randomValue = (Math.random() * 100).toFixed(2);

        // console.log(`🎲 Simu ${variable.nom} : ${randomValue}`);
        await Mesure.create({ variable_id: variable.id, valeur: randomValue, timestamp: now });
        return;
    }

    // --- MODE RÉEL ---
    const client = new ModbusRTU();
    try {
        await client.connectTCP(variable.ip_automate, { port: 502 });
        client.setID(1);
        client.setTimeout(2000);

        const addr = parseInt(variable.registre);
        let val;

        if (variable.type === "boolean") {
            const data = await client.readCoils(addr, 1);
            val = data.data[0] ? 1 : 0;
        } else {
            const data = await client.readHoldingRegisters(addr, 1);
            let rawValue = data.data[0];
            const divisor = Math.pow(10, variable.decimals || 0);
            val = rawValue / divisor;
        }

        console.log(`✅ Succès ${variable.nom} : ${val}`);
        await Mesure.create({ variable_id: variable.id, valeur: val, timestamp: now });

    } catch (error) {
        if (error.code !== 'ETIMEDOUT') {
            console.error(`❌ Erreur Modbus sur ${variable.ip_automate} (Var: ${variable.nom}) :`, error.message);
        }
        // Enregistrement de l'erreur (-1)
        await Mesure.create({ variable_id: variable.id, valeur: -1, timestamp: now });

    } finally {
        try { await client.close(); } catch (e) { }
    }
};
