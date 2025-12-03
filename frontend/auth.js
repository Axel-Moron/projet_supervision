
// auth.js - Gestion de l'authentification et de l'affichage utilisateur

const API_AUTH_URL = "http://localhost:3000/api/auth";

// Variable globale pour stocker l'état admin
let currentUser = {
    username: null,
    isAdmin: false
};

// Fonction pour récupérer l'utilisateur connecté
async function fetchUser() {
    try {
        const response = await fetch(`${API_AUTH_URL}/me`, { credentials: "include" });
        const data = await response.json();

        if (data.authenticated) {
            currentUser.username = data.username;
            currentUser.isAdmin = data.isAdmin;
            updateUserHeader();
        } else {
            // Si pas connecté, redirection (sécurité supplémentaire)
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Erreur auth:", error);
    }
}

// Fonction pour mettre à jour l'affichage dans le header
function updateUserHeader() {
    const headerRight = document.querySelector('.topbar-right') || document.querySelector('.topbar');

    // Création de l'élément utilisateur s'il n'existe pas
    let userDisplay = document.getElementById('user-display');
    if (!userDisplay) {
        userDisplay = document.createElement('div');
        userDisplay.id = 'user-display';

        // Insérer avant l'horloge ou à la fin
        const clock = document.querySelector('.topbar-clock');
        if (clock) {
            clock.parentNode.insertBefore(userDisplay, clock);
        } else {
            headerRight.appendChild(userDisplay);
        }
    }

    // Contenu : Icône + Nom + Badge Admin
    userDisplay.innerHTML = `
        <span class="user-icon">👤</span>
        <span>${currentUser.username}</span>
        ${currentUser.isAdmin ? '<span class="pill ok user-admin-badge">ADMIN</span>' : ''}
    `;
}

// Fonction pour vérifier les droits admin (utilisée par config.html)
function checkAdminAccess() {
    if (!currentUser.isAdmin) {
        alert("⛔ ACCÈS REFUSÉ\n\nVous devez être administrateur pour effectuer cette action.");
        return false;
    }
    return true;
}

// Lancer la récupération au chargement
document.addEventListener('DOMContentLoaded', fetchUser);
