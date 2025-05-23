// CrearDelivery.js

// Abrir popup creación delivery
document.getElementById('btn-nuevo-delivery').addEventListener('click', () => {
	document.getElementById('create-delivery-form').reset(); // limpiar form
	document.getElementById('create-delivery-popup').style.display = 'flex';
});

// Cerrar popup creación
document.getElementById('create-delivery-close').addEventListener('click', () => {
	document.getElementById('create-delivery-popup').style.display = 'none';
});

// Crear delivery - enviar formulario
document.getElementById('create-delivery-form').addEventListener('submit', (e) => {
	e.preventDefault();

	const clave = document.getElementById('create-clave').value;
	const claveConfirm = document.getElementById('create-confirm-clave').value;

	if (clave !== claveConfirm) {
		alert("Las contraseñas no coinciden.");
		return;
	}

	const nuevoDelivery = {
		nombre: document.getElementById('create-nombre').value.trim(),
		documento: document.getElementById('create-documento').value.trim(),
		telefono: document.getElementById('create-telefono').value.trim(),
		direccion: document.getElementById('create-direccion').value.trim(),
		unidad: document.getElementById('create-unidad').value.trim(),
		placa: document.getElementById('create-placa').value.trim(),
		clave: clave,
		nivel: 3, // Nivel Delivery fijo
		estado: true
	};

	fetch('/mesalista/api/delivery', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(nuevoDelivery),
	})
		.then(res => {
			if (!res.ok) throw new Error("Error al crear delivery");
			alert("Delivery creado con éxito");
			document.getElementById('create-delivery-popup').style.display = 'none';
			e.target.reset();

			// Disparar evento opcional para refrescar listado
			const event = new Event('deliveryCreado');
			document.dispatchEvent(event);
		})
		.catch(err => {
			//console.error(err);
			//alert("Error al crear delivery");
		});
});

