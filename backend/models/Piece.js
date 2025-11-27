import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Operateur from "./Operateur.js";

const Piece = sequelize.define("Piece", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  numero_serie: { type: DataTypes.STRING, allowNull: false },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.BOOLEAN, allowNull: true }
}, { tableName: "pieces", timestamps: false });

Piece.belongsTo(Operateur, { foreignKey: "operateur_id" });

export default Piece;
