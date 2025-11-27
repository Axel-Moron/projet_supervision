/**
 * Routes pour la gestion des résultats de tests
 * Permet d'ajouter et consulter les résultats des tests qualité
 * Toutes les routes nécessitent une authentification
 */

import express from "express";
import Resultat from "../models/Resultat.js";
import Test from "../models/Test.js";
import Piece from "../models/Piece.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// POST /api/resultats - Ajouter un résultat de test pour une pièce
router.post("/", async (req, res) => {
  try {
    const { piece_id, test_id, resultat_boolean, resultat_numeric } = req.body;

    // Validation des champs requis
    if (!piece_id || !test_id) {
      return res.status(400).json({ error: "piece_id et test_id sont requis" });
    }

    // Vérifier que la pièce existe
    const piece = await Piece.findByPk(piece_id);
    if (!piece) {
      return res.status(404).json({ error: "Pièce non trouvée" });
    }

    // Vérifier que le test existe
    const test = await Test.findByPk(test_id);
    if (!test) {
      return res.status(404).json({ error: "Test non trouvé" });
    }

    // Validation selon le type de test
    if (test.type_test === "boolean") {
      if (resultat_boolean === null || resultat_boolean === undefined) {
        return res.status(400).json({ error: `Le test "${test.nom_test}" nécessite un résultat boolean` });
      }
      if (resultat_numeric !== null && resultat_numeric !== undefined) {
        return res.status(400).json({ error: `Le test "${test.nom_test}" ne doit pas avoir de valeur numérique` });
      }
    } else if (test.type_test === "numeric") {
      if (resultat_numeric === null || resultat_numeric === undefined) {
        return res.status(400).json({ error: `Le test "${test.nom_test}" nécessite un résultat numérique` });
      }
      if (typeof resultat_numeric !== "number" || isNaN(resultat_numeric)) {
        return res.status(400).json({ error: `Le test "${test.nom_test}" nécessite un nombre valide` });
      }
      // Note: On n'impose pas de contrainte sur les seuils ici pour permettre
      // d'enregistrer des valeurs non conformes (en dehors des seuils)
      // La conformité est déterminée côté frontend et stockée dans le statut de la pièce
      if (resultat_boolean !== null && resultat_boolean !== undefined) {
        return res.status(400).json({ error: `Le test "${test.nom_test}" ne doit pas avoir de valeur boolean` });
      }
    }

    const result = await Resultat.create({ piece_id, test_id, resultat_boolean, resultat_numeric });
    res.status(201).json(result);
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ error: "Erreur de contrainte de clé étrangère. Vérifiez que la pièce et le test existent." });
    }
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les résultats
router.get("/", async (req, res) => {
  try {
    const resultats = await Resultat.findAll({
      include: [Test, { association: "Piece" }],
      order: [["date_test", "DESC"]]
    });
    res.json(resultats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer résultats d'une pièce
router.get("/:piece_id", async (req, res) => {
  try {
    const pieceId = parseInt(req.params.piece_id);

    if (isNaN(pieceId)) {
      return res.status(400).json({ error: "ID pièce invalide" });
    }

    // Vérifier que la pièce existe
    const piece = await Piece.findByPk(pieceId);
    if (!piece) {
      return res.status(404).json({ error: "Pièce non trouvée" });
    }

    const resultats = await Resultat.findAll({
      where: { piece_id: pieceId },
      include: Test
    });
    res.json(resultats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
