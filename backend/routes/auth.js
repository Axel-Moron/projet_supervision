import express from "express";
import Operateur from "../models/Operateur.js";

const router = express.Router();

// Login - Sélection d'un opérateur
router.post("/login", async (req, res) => {
  try {
    const { operateur_id } = req.body;

    // Validation
    if (!operateur_id) {
      return res.status(400).json({ error: "ID opérateur requis" });
    }

    const operateurId = parseInt(operateur_id);
    if (isNaN(operateurId)) {
      return res.status(400).json({ error: "ID opérateur invalide" });
    }

    const operateur = await Operateur.findByPk(operateurId);
    if (!operateur) {
      return res.status(404).json({ error: "Opérateur non trouvé" });
    }

    // Créer la session
    req.session.operateur_id = operateur.id;
    req.session.operateur_name = `${operateur.nom} ${operateur.prenom}`;

    res.json({
      success: true,
      operateur: {
        id: operateur.id,
        nom: operateur.nom,
        prenom: operateur.prenom
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la déconnexion" });
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  });
});

// Vérifier l'état de la session
router.get("/me", (req, res) => {
  if (req.session && req.session.operateur_id) {
    res.json({
      authenticated: true,
      operateur: {
        id: req.session.operateur_id,
        name: req.session.operateur_name
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;

