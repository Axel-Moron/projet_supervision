import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Variable = sequelize.define("Variable", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  ip_automate: { type: DataTypes.STRING, allowNull: false },
  registre: { type: DataTypes.STRING, allowNull: false }, // Ex: "40001"
  frequence: { type: DataTypes.INTEGER, defaultValue: 5 }, // En secondes
  actif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: "variables", timestamps: false });

export default Variable;