-- Création de la base
CREATE DATABASE IF NOT EXISTS qualite_db;
USE qualite_db;

-- Table des opérateurs
CREATE TABLE IF NOT EXISTS operateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL
);

-- Table des pièces
CREATE TABLE IF NOT EXISTS pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_serie VARCHAR(50) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operateur_id INT,
    status BOOLEAN NULL,
    FOREIGN KEY (operateur_id) REFERENCES operateurs(id)
);

-- Table des types de tests
CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_test VARCHAR(100) NOT NULL,
    type_test VARCHAR(50) NOT NULL, -- ex: 'boolean', 'numeric'
    seuil_min INT NULL,
    seuil_max INT NULL
);

-- Table des résultats des tests
CREATE TABLE IF NOT EXISTS resultats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    piece_id INT NOT NULL,
    test_id INT NOT NULL,
    resultat_boolean BOOLEAN NULL,
    resultat_numeric INT NULL,
    date_test TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
