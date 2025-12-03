# 🛠️ Projet de Supervision d’Automate (Modbus TCP)

Ce projet permet de superviser en temps réel des variables provenant d’un automate industriel via le protocole **Modbus TCP**, d’afficher les valeurs sur une interface web moderne, de gérer l’historique et d’exporter les données.

---

## 📌 Contexte et Objectifs

Ce projet a été réalisé dans le cadre d'un **Hackathon Industriel**. L'objectif est de développer une solution de **relevé de données process** open-source, flexible et indépendante des solutions propriétaires coûteuses.

### 🎯 Enjeux
- **Indépendance technologique** : S'affranchir des licences coûteuses.
- **Flexibilité** : Adapter le suivi aux besoins spécifiques de chaque installation.
- **Déploiement rapide** : Une solution "clé en main" déployable en quelques minutes sur un réseau local.

### 💡 Fonctionnalités Clés
1.  **Paramétrage intuitif** : Configuration des automates (IP, variables, fréquence) via une interface web.
2.  **Supervision Temps Réel** : Tableau de bord interactif avec graphiques dynamiques.
3.  **Historique et Export** : Consultation des données passées et export CSV pour analyse.
4.  **Architecture Modulaire** : Backend (Node.js), Frontend (Vanilla JS), BDD (MariaDB) conteneurisés avec Docker.
---

## 🚀 Technologies utilisées

### **Backend**
- Node.js  
- Express  
- MariaDB (MySQL compatible)  
- Modbus-serial  
- Node-cron  

### **Frontend**
- HTML / CSS  
- JavaScript vanilla  
- Dashboard responsive  

---

---
 
 ## 🏗️ Architecture Technique
 
 L'application est conçue autour de 3 services conteneurisés (Docker) :
 
 1.  **Frontend (Nginx)** : Sert l'interface utilisateur (HTML/CSS/JS) sur le port `8080`.
 2.  **Backend (Node.js)** : API REST qui gère la logique métier, la communication Modbus, et les tâches planifiées (Cron). Port `3000`.
 3.  **Base de Données (MariaDB)** : Stocke les configurations et l'historique des mesures. Port `3307`.
 
 Les conteneurs communiquent entre eux via un réseau Docker dédié (`app-network`).
 
 ---
 
 ## 📦 Prérequis

Avant de commencer, assure-toi d’avoir installé :

- **Node.js** (version 18+ recommandée)  
- **MariaDB** ou **MySQL**  
- Un automate Modbus TCP (ou un simulateur comme Modbus Pal / Modbus Server)  

---

## 🛠️ Installation

Clone le projet :

```
git clone https://github.com/nomDuRepo/projet_supervision.git
```

Entre dans le dossier backend :

```
cd backend
npm install
```

Configure la base de données dans le fichier `.env` :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tonMDP
DB_NAME=supervision
```

Lance le backend :

```
npm run dev
```

Ensuite, lance le frontend (fichier `index.html`) via Live Server ou directement dans ton navigateur.

---

## 🖥️ Utilisation

### ▶️ 1. Interface Dashboard
- Affiche les valeurs en direct  
- Mise à jour automatique  
- Indicateur d’état du Modbus  

### ⚙️ 2. Paramétrage des variables
Tu peux :

- Ajouter une variable  
- Modifier IP, registre, fréquence  
- Activer / désactiver une variable  
- Supprimer une variable  

### 📅 3. Historique des mesures
- Visualisation des données historiques  
- Tri par variable  
- Export CSV  

---

## 🐳 Déploiement Docker (Requis pour le Hackathon)

1.  **Prérequis** : Avoir Docker et Docker Compose installés.
2.  **Lancement** :
    À la racine du projet (là où se trouve `docker-compose.yml`), lance la commande :
    ```bash
    docker-compose up --build
    ```
3.  **Accès** :
    -   **Frontend** : `http://localhost:8080`
    -   **Backend** : `http://localhost:3000`
    -   **Base de données** : Port `3307` (User: root, Pass: admin)

### 🌐 Accès depuis le réseau local
Pour accéder à l'application depuis un autre PC :
1.  Récupère l'IP de ton PC serveur (ex: `ipconfig` -> `192.168.1.25`).
2.  Sur l'autre PC, ouvre le navigateur : `http://192.168.1.25:8080`.

---

## 👨‍💻 Contributeurs

- **Valentin G.**
- **Axel M.** 

---

## 📄 Licence

Projet réalisé dans le cadre d’un travail scolaire.  
Usage interne uniquement.

