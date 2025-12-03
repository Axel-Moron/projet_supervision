# 🛠️ Projet de Supervision d’Automate (Modbus TCP)

Ce projet permet de superviser en temps réel des variables provenant d’un automate industriel via le protocole **Modbus TCP**, d’afficher les valeurs sur une interface web moderne, de gérer l’historique et d’exporter les données.

---

## 📌 Description

Cette application permet :

- De lire des registres Modbus en continu  
- D’afficher les mesures en temps réel  
- De gérer dynamiquement les variables à superviser  
- De stocker les mesures dans une base de données MariaDB  
- D’afficher un dashboard web moderne  
- D’exporter les données au format CSV  
- D’ajouter un mode simulation pour tests hors-ligne  

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

## 🗺️ Roadmap

- Ajouter un mode simulation complet  
- Ajouter l’export Excel avec mise en forme  
- Ajouter une authentification avancée  
- Ajouter des graphiques temps réel  
- Ajouter un dark/light mode  

---

## 👨‍💻 Contributeurs

- **Valentin G.**
- **Axel M.** 

---

## 📄 Licence

Projet réalisé dans le cadre d’un travail scolaire.  
Usage interne uniquement.

