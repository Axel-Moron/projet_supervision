import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Piece from "./Piece.js";
import Test from "./Test.js";

const Resultat = sequelize.define("Resultat", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  resultat_boolean: { type: DataTypes.BOOLEAN, allowNull: true },
  resultat_numeric: { type: DataTypes.REAL, allowNull: true },
  date_test: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "resultats", timestamps: false });

Resultat.belongsTo(Piece, { foreignKey: "piece_id" });
Resultat.belongsTo(Test, { foreignKey: "test_id" });

export default Resultat;