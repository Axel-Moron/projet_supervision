import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Test = sequelize.define("Test", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom_test: { type: DataTypes.STRING, allowNull: false },
  type_test: { type: DataTypes.STRING, allowNull: false },
  seuil_min: { type: DataTypes.INTEGER, allowNull: true },
  seuil_max: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: "tests", timestamps: false });

export default Test;