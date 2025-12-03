// --- INITIALISATION CHART ---
let chart;
let currentVarId = null;

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
                backgroundColor: "rgba(79, 195, 247, 0.1)",
                pointRadius: 2,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: '#8899ac' },
                    grid: { color: '#1c2844' }
                },
                y: {
                    beginAtZero: false,
                    ticks: { color: '#8899ac' },
                    grid: { color: '#1c2844' }
                }
            },
            plugins: {
                legend: { labels: { color: '#e5ecff' } }
            }
        }
    });
}

// --- FONCTION POUR AJOUTER VALEURS ---
function updateChart(variableId, value, timestamp) {
    if (!chart) createChart();

    // Si on change de variable, on reset le graph
    if (currentVarId !== variableId) {
        currentVarId = variableId;
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
    }

    const timeLabel = new Date(timestamp).toLocaleTimeString();

    // Eviter les doublons de temps si update trop rapide
    if (chart.data.labels.length > 0 && chart.data.labels[chart.data.labels.length - 1] === timeLabel) {
        return;
    }

    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(value);

    // Garder seulement les 60 derniers points
    if (chart.data.labels.length > 60) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

// --- EXPORT GLOBAL ---
window.updateRealtimeChart = updateChart;
