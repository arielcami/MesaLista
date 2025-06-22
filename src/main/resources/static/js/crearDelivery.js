// Referencias DOM
const form = document.getElementById('create-delivery-form');
const popup = document.getElementById('create-delivery-popup');
const closeBtn = document.getElementById('create-delivery-close');

const inputs = {
	nombre: document.getElementById('create-nombre'),
	documento: document.getElementById('create-documento'),
	telefono: document.getElementById('create-telefono'),
	direccion: document.getElementById('create-direccion'),
	unidad: document.getElementById('create-unidad'),
	placa: document.getElementById('create-placa'),
	clave: document.getElementById('create-clave'),
	claveConfirm: document.getElementById('create-confirm-clave'),
};

// Abrir popup de creación
document.getElementById('btn-nuevo-delivery').addEventListener('click', () => {
	form.reset();
	popup.style.display = 'flex';
});

// Cerrar popup y limpiar
closeBtn.addEventListener('click', () => {
	popup.style.display = 'none';
	form.reset();
});

// Enviar formulario (con confirmación previa)
form.addEventListener('submit', async (e) => {
	e.preventDefault();

	// Obtener valores
	const nombre = inputs.nombre.value.trim();
	const documento = inputs.documento.value.trim();
	const telefono = inputs.telefono.value.trim();
	const direccion = inputs.direccion.value.trim();
	const unidad = inputs.unidad.value.trim();
	const placa = inputs.placa.value.trim();
	const clave = inputs.clave.value;
	const claveConfirm = inputs.claveConfirm.value;

	// Validaciones
	if (!nombre || !documento || !telefono || !direccion || !unidad || !placa || !clave || !claveConfirm) {
		return mostrarPopupConfirmacion("Warning", "Todos los campos son obligatorios.");
	}

	if (clave !== claveConfirm) {
		return mostrarPopupConfirmacion("Warning", "Las contraseñas no coinciden.");
	}

	if (!/^\d{7,15}$/.test(telefono)) {
		return mostrarPopupConfirmacion("Warning", "El teléfono debe tener entre 7 y 15 dígitos numéricos.");
	}

	const nuevoDelivery = {
		nombre,
		documento,
		telefono,
		direccion,
		unidad,
		placa,
		clave,
		nivel: 3,
		estado: true
	};

	// Confirmación previa
	mostrarPopupConfirmacion("Question", "¿Deseas registrar este delivery?", async () => {
		const submitBtn = form.querySelector('button[type="submit"]');
		submitBtn.disabled = true;

		try {
			const res = await fetch('/mesalista/api/delivery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(nuevoDelivery),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Error desconocido al crear delivery");
			}

			mostrarPopupConfirmacion("Success", "Delivery creado con éxito.");
			popup.style.display = 'none';
			form.reset();

			document.dispatchEvent(new Event('deliveryCreado'));

		} catch (err) {
			mostrarPopupConfirmacion("Error", "Error al crear delivery: " + err.message);
		} finally {
			submitBtn.disabled = false;
		}
	});
});
