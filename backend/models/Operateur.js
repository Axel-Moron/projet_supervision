import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Operateur = sequelize.define("Operateur", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false }
}, { tableName: "operateurs", timestamps: false });

export default Operateur;