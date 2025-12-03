import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Variable = sequelize.define("Variable", {
    nom: { type: DataTypes.STRING, allowNull: false },
    ip_automate: { type: DataTypes.STRING, allowNull: false },
    registre: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }, // 'float' ou 'boolean'
    frequence: { type: DataTypes.INTEGER, defaultValue: 5 },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    // --- NOUVEAUX CHAMPS ---
    decimals: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0, 
        comment: "0 = Entier, 1 = /10, 2 = /100" 
    },
    unit: { 
        type: DataTypes.STRING, 
        allowNull: true, 
        defaultValue: "" 
    },
    seuil_min: { 
        type: DataTypes.FLOAT, 
        allowNull: true, // Peut être vide
        defaultValue: null 
    },
    seuil_max: { 
        type: DataTypes.FLOAT, 
        allowNull: true, // Peut être vide
        defaultValue: null 
    }
});

export default Variable;