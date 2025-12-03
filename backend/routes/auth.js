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
    req.session.isAdmin = user.isAdmin; // On stocke le rôle dans la session

    res.json({ success: true, message: "Connexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route d'inscription (Création de compte)
router.post("/register", async (req, res) => {
  try {
    const { username, password, adminUsername, adminPassword, isAdmin } = req.body;

    // 1. Vérification de l'administrateur
    const adminUser = await User.findOne({ where: { username: adminUsername } });
    if (!adminUser || adminUser.password !== adminPassword) {
      return res.status(401).json({ error: "Identifiants administrateur incorrects" });
    }

    // 2. Vérifier si l'utilisateur validant est bien admin
    if (!adminUser.isAdmin) {
      return res.status(403).json({ error: "Ce compte n'a pas les droits d'administrateur" });
    }

    // 3. Vérifier si le nouvel utilisateur existe déjà
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet utilisateur existe déjà" });
    }

    // 4. Création du nouvel utilisateur
    await User.create({
      username,
      password,
      isAdmin: isAdmin || false
    });

    res.json({ success: true, message: "Utilisateur créé avec succès" });

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
    res.json({ authenticated: true, username: req.session.username, isAdmin: req.session.isAdmin });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;