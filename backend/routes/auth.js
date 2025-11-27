import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ where: { username } });

    // 2. Vérifier le mot de passe (comparaison simple pour le TP)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // 3. Créer la session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ success: true, message: "Connexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route de déconnexion
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Vérifier si on est connecté (utile pour sécuriser les pages)
router.get("/me", (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;