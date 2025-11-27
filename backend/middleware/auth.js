/**
 * Middleware d'authentification
 * Vérifie que l'utilisateur est authentifié via la session
 * Ajoute les informations de l'opérateur à la requête si authentifié
 */
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.operateur_id) {
    req.operateur_id = req.session.operateur_id;
    req.operateur_name = req.session.operateur_name;
    next();
  } else {
    res.status(401).json({ error: "Non authentifié" });
  }
};

