// mapa.js

// Coordenadas de ejemplo (Lima, Perú)
const lat = -12.0464;
const lng = -77.0428;

document.addEventListener('DOMContentLoaded', () => {
	// Inicializa el mapa
	const map = L.map('map').setView([lat, lng], 13);

	// Agrega la capa de OpenStreetMap
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);

	// Agrega un marcador
	L.marker([lat, lng]).addTo(map)
		.bindPopup('Tu destino')
		.openPopup();
});
