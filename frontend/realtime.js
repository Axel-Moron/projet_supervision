// --- INITIALISATION CHART ---
let chart;

function createChart() {
    const ctx = document.getElementById("realtimeChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Valeur",
                data: [],
                borderWidth: 2,
                borderColor: "#4fc3f7",
                pointRadius: 0,
                tension: 0.2
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// --- FONCTION POUR AJOUTER VALEURS ---
async function updateChart(value) {
    if (!chart) createChart();

    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(value);

    // Garder seulement les 120 derniers points (2 minutes)
    if (chart.data.labels.length > 120) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

// --- LIER AU CLICK D’UNE VARIABLE ---
window.startRealtime = function(value) {
    updateChart(value); // Ajout immédiat
};
