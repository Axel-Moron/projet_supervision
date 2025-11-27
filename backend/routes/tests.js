import express from "express";
import Test from "../models/Test.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nom_test, type_test, seuil_min, seuil_max } = req.body;

    // Validation
    if (!nom_test || typeof nom_test !== "string" || nom_test.trim().length === 0) {
      return res.status(400).json({ error: "Le nom du test est requis et doit être une chaîne non vide" });
    }

    if (!type_test || !["boolean", "checkbox", "numeric"].includes(type_test)) {
      return res.status(400).json({ error: "Le type de test doit être 'boolean', 'checkbox' ou 'numeric'" });
    }

    // Validation des seuils selon le type
    if (type_test === "numeric") {
      if (seuil_min !== null && seuil_min !== undefined) {
        if (typeof seuil_min !== "number" || isNaN(seuil_min)) {
          return res.status(400).json({ error: "seuil_min doit être un nombre" });
        }
      }
      if (seuil_max !== null && seuil_max !== undefined) {
        if (typeof seuil_max !== "number" || isNaN(seuil_max)) {
          return res.status(400).json({ error: "seuil_max doit être un nombre" });
        }
        if (seuil_min !== null && seuil_min !== undefined && seuil_max < seuil_min) {
          return res.status(400).json({ error: "seuil_max doit être supérieur ou égal à seuil_min" });
        }
      }
    } else {
      // Pour les tests boolean et checkbox, les seuils doivent être null
      if (seuil_min !== null || seuil_max !== null) {
        return res.status(400).json({ error: "Les seuils doivent être null pour un test de type boolean ou checkbox" });
      }
    }

    const test = await Test.create({ 
      nom_test: nom_test.trim(), 
      type_test, 
      seuil_min, 
      seuil_max 
    });
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const tests = await Test.findAll();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const testId = parseInt(req.params.id);

    if (isNaN(testId)) {
      return res.status(400).json({ error: "ID test invalide" });
    }

    const deleted = await Test.destroy({ where: { id: testId } });
    if (deleted) {
      res.json({ message: "Test supprimé" });
    } else {
      res.status(404).json({ error: "Test non trouvé" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
