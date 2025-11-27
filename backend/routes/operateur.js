import express from "express";
import Piece from "../models/Piece.js";
import Operateur from "../models/Operateur.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nom, prenom } = req.body;

    // Validation
    if (!nom || typeof nom !== "string" || nom.trim().length === 0) {
      return res.status(400).json({ error: "Le nom est requis et doit être une chaîne non vide" });
    }

    if (!prenom || typeof prenom !== "string" || prenom.trim().length === 0) {
      return res.status(400).json({ error: "Le prénom est requis et doit être une chaîne non vide" });
    }

    // Limiter la longueur
    if (nom.trim().length > 100) {
      return res.status(400).json({ error: "Le nom ne doit pas dépasser 100 caractères" });
    }

    if (prenom.trim().length > 100) {
      return res.status(400).json({ error: "Le prénom ne doit pas dépasser 100 caractères" });
    }

    const operateur = await Operateur.create({ 
      nom: nom.trim(), 
      prenom: prenom.trim() 
    });
    res.status(201).json(operateur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const operateurs = await Operateur.findAll();
    res.json(operateurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const operateurId = parseInt(req.params.id);

    if (isNaN(operateurId)) {
      return res.status(400).json({ error: "ID opérateur invalide" });
    }

    const deleted = await Operateur.destroy({ where: { id: operateurId } });
    if (deleted) {
      res.json({ message: "Operateur supprimé" });
    } else {
      res.status(404).json({ error: "Operateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
