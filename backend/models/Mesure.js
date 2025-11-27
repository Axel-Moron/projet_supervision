import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Variable from "./Variable.js";

const Mesure = sequelize.define("Mesure", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  valeur: { type: DataTypes.FLOAT, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "mesures", timestamps: false });

// Liaison : Une mesure appartient à une variable
Mesure.belongsTo(Variable, { foreignKey: "variable_id", onDelete: 'CASCADE' });

export default Mesure;