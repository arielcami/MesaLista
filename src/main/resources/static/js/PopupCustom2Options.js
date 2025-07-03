function mostrarPopupConfirmacion(tipo, mensaje, onConfirm, onCancel) {
	const modal = document.getElementById('popup-custom-modal');
	const mensajeElem = document.getElementById('popup-message');
	const iconoElem = document.getElementById('popup-icon');
	const btnConfirmar = document.getElementById('popup-confirm-btn');
	const btnCancelar = document.getElementById('popup-cancel-btn');

	mensajeElem.textContent = mensaje;

	const tiposValidos = ['Success', 'Error', 'Warning', 'Question'];
	const tipoNormalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
	const tipoFinal = tiposValidos.includes(tipoNormalizado) ? tipoNormalizado : 'Warning';

	iconoElem.style.backgroundImage = `url('/mesalista/img/${tipoFinal}.png')`;

	modal.classList.remove('hidden');

	const nuevoConfirmar = btnConfirmar.cloneNode(true);
	const nuevoCancelar = btnCancelar.cloneNode(true);

	btnConfirmar.parentNode.replaceChild(nuevoConfirmar, btnConfirmar);
	btnCancelar.parentNode.replaceChild(nuevoCancelar, btnCancelar);

	nuevoConfirmar.addEventListener('click', function() {
		cerrarPopup(() => {
			if (typeof onConfirm === 'function') onConfirm();
		});
	});

	nuevoCancelar.addEventListener('click', function() {
		cerrarPopup(() => {
			if (typeof onCancel === 'function') onCancel();
		});
	});

	document.addEventListener('keydown', function handler(e) {
		if (e.key === 'Escape') {
			cerrarPopup();
			document.removeEventListener('keydown', handler);
		}
	});

	modal.addEventListener('click', function(e) {
		if (e.target === modal) cerrarPopup();
	});
}

function cerrarPopup(callback) {
	const modal = document.getElementById('popup-custom-modal');
	modal.classList.add('ppp-modal2opt-closing');

	const content = modal.querySelector('.ppp-modal2opt-content');
	content.addEventListener(
		'animationend',
		() => {
			modal.classList.remove('ppp-modal2opt-closing');
			modal.classList.add('hidden');
			if (typeof callback === 'function') callback();
		},
		{ once: true }
	);
}
