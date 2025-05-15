// === Función para cerrar el popup ===
function cerrarPopupCustom() {
	const modal = document.getElementById('popup-custom-modal');
	modal.classList.add('hidden');
}

// === Función para mostrar el popup ===
function mostrarPopupCustom(tipo, mensaje) {
	const modal = document.getElementById('popup-custom-modal');
	const mensajeElem = document.getElementById('popup-message');
	const iconoElem = document.getElementById('popup-icon');

	// Setear el mensaje
	mensajeElem.textContent = mensaje;

	// Cambiar icono según tipo (success, error, warning, question)
	iconoElem.style.backgroundImage = `url('/mesalista/img/${tipo.charAt(0).toUpperCase() + tipo.slice(1)}.png')`;

	// Mostrar el popup
	modal.classList.remove('hidden');
}

// === Esperar a que el DOM esté completamente cargado antes de añadir los listeners ===
document.addEventListener("DOMContentLoaded", function () {
	const modal = document.getElementById('popup-custom-modal');

	// Cerrar popup si se hace clic fuera del contenido
	if (modal) {
		modal.addEventListener('click', function(event) {
			if (event.target.id === 'popup-custom-modal') {
				cerrarPopupCustom();
			}
		});
	}

	// Cerrar popup con tecla Escape
	document.addEventListener('keydown', function(event) {
		if (event.key === "Escape") {
			if (!modal.classList.contains('hidden')) {
				cerrarPopupCustom();
			}
		}
	});
});
