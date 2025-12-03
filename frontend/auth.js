
// auth.js - Gestion de l'authentification et de l'affichage utilisateur

const API_AUTH_URL = "http://localhost:3000/api/auth";

// Variable globale pour stocker l'état admin
// Variable globale pour stocker l'état admin
window.currentUser = {
    username: null,
    isAdmin: false
};

// Fonction pour récupérer l'utilisateur connecté
async function fetchUser() {
    try {
        const response = await fetch(`${API_AUTH_URL}/me`, { credentials: "include" });
        const data = await response.json();

        if (data.authenticated) {
            console.log("DEBUG auth.js: User authenticated:", data.username, "IsAdmin:", data.isAdmin);
            window.currentUser.username = data.username;
            window.currentUser.isAdmin = data.isAdmin;
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

    // Contenu : Icône + Nom + Badge Admin + Logout
    userDisplay.innerHTML = `
        <span class="user-icon">👤</span>
        <span>${window.currentUser.username}</span>
        ${window.currentUser.isAdmin ? '<span class="pill ok user-admin-badge">ADMIN</span>' : ''}
        <button onclick="logout()" style="margin-left: 15px; padding: 8px 15px; background: #ff4b4b; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 13px; font-weight: bold;">Déconnexion</button>
    `;
}

// Fonction de déconnexion globale
async function logout() {
    try { await fetch(`${API_AUTH_URL}/logout`, { method: "POST", credentials: "include" }); } catch (e) { }
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// Fonction pour vérifier les droits admin (utilisée par config.html)
// Fonction pour vérifier les droits admin (utilisée par config.html)
window.checkAdminAccess = function () {
    console.log("Checking admin access. IsAdmin:", window.currentUser.isAdmin);
    if (!window.currentUser.isAdmin) {
        alert("⛔ ACCÈS REFUSÉ\n\nVous devez être administrateur pour effectuer cette action.");
        return false;
    }
    return true;
};

// Lancer la récupération au chargement
document.addEventListener('DOMContentLoaded', fetchUser);
