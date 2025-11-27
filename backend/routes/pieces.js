/**
 * Routes pour la gestion des pièces électroniques
 * Toutes les routes nécessitent une authentification
 */

import express from "express";
import { Op } from "sequelize";
import Piece from "../models/Piece.js";
import Operateur from "../models/Operateur.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// POST /api/pieces - Créer une nouvelle pièce électronique
router.post("/", async (req, res) => {
  try {
    const { numero_serie } = req.body;

    // Validation
    if (!numero_serie || typeof numero_serie !== "string" || numero_serie.trim().length === 0) {
      return res.status(400).json({ error: "Le numéro de série est requis et doit être une chaîne non vide" });
    }

    // Vérifier si le numéro de série existe déjà
    const existingPiece = await Piece.findOne({ where: { numero_serie: numero_serie.trim() } });
    if (existingPiece) {
      return res.status(409).json({ error: "Une pièce avec ce numéro de série existe déjà" });
    }

    // Utiliser l'ID de l'opérateur depuis la session
    const piece = await Piece.create({ 
      numero_serie: numero_serie.trim(), 
      operateur_id: req.operateur_id 
    });
    res.status(201).json(piece);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Construire les conditions de filtrage
    const where = {};
    
    if (status !== undefined && status !== "all") {
      if (status === "null") {
        where.status = { [Op.is]: null };
      } else if (status === "true") {
        where.status = true;
      } else if (status === "false") {
        where.status = false;
      }
    }

    // Calculer la pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Compter le total pour la pagination
    const countOptions = Object.keys(where).length > 0 ? { where } : {};
    const total = await Piece.count(countOptions);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Récupérer les pièces avec pagination
    const findOptions = {
      include: Operateur,
      limit: limitNum,
      offset: offset,
      order: [["date_creation", "DESC"]]
    };
    
    if (Object.keys(where).length > 0) {
      findOptions.where = where;
    }
    
    const pieces = await Piece.findAll(findOptions);

    res.json({
      pieces,
      currentPage: pageNum,
      totalPages,
      total,
      limit: limitNum
    });
  } catch (err) {
    console.error("Erreur dans GET /pieces:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/numero/:numero_serie", async (req, res) => {
  try {
    const numero_serie = req.params.numero_serie;

    if (!numero_serie || numero_serie.trim().length === 0) {
      return res.status(400).json({ error: "Numéro de série invalide" });
    }

    const piece = await Piece.findOne({
      where: { numero_serie: numero_serie.trim() },
      include: Operateur
    });
    if (piece) {
      res.json(piece);
    } else {
      res.status(404).json({ error: "Pièce non trouvée" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const pieceId = parseInt(req.params.id);

    if (isNaN(pieceId)) {
      return res.status(400).json({ error: "ID de pièce invalide" });
    }

    // Validation du status (doit être boolean ou null)
    if (status !== null && status !== undefined && typeof status !== "boolean") {
      return res.status(400).json({ error: "Le statut doit être un boolean ou null" });
    }

    const piece = await Piece.findByPk(pieceId);
    if (!piece) {
      return res.status(404).json({ error: "Pièce non trouvée" });
    }

    piece.status = status;
    await piece.save();
    res.json(piece);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pieceId = parseInt(req.params.id);

    if (isNaN(pieceId)) {
      return res.status(400).json({ error: "ID pièce invalide" });
    }

    const deleted = await Piece.destroy({ where: { id: pieceId } });
    if (deleted) {
      res.json({ message: "Piece supprimée" });
    } else {
      res.status(404).json({ error: "Piece non trouvée" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
