document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('form');
	if (!form) {
		console.error('Formulario no encontrado');
		return;
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault(); // evitar envío por ahora

		// Obtener campos
		const idEmpleado = form.querySelector('input[name="idEmpleado"]');
		const nombre = form.querySelector('input[name="nombre"]');
		const telefono = form.querySelector('input[name="telefono"]');
		const documento = form.querySelector('input[name="documento"]');
		const nuevaClave = form.querySelector('input[name="nuevaClave"]');
		const confirmarClave = form.querySelector('input[name="confirmarClave"]');

		// Validaciones básicas
		let valido = true;
		const errores = [];

		if (!idEmpleado.value || isNaN(idEmpleado.value) || Number(idEmpleado.value) < 1) {
			errores.push('ID de empleado inválido');
			valido = false;
		}

		if (!nombre.value.trim()) {
			errores.push('Nombre es requerido');
			valido = false;
		}

		if (!telefono.value.trim()) {
			errores.push('Teléfono es requerido');
			valido = false;
		}

		if (!documento.value.trim()) {
			errores.push('Documento es requerido');
			valido = false;
		}

		if (!nuevaClave.value || nuevaClave.value.length < 6) {
			errores.push('Nueva contraseña debe tener al menos 6 caracteres');
			valido = false;
		}

		if (nuevaClave.value !== confirmarClave.value) {
			errores.push('Las contraseñas no coinciden');
			valido = false;
		}

		if (valido) {
			console.log('Formulario válido. Enviando datos:');
			console.log({
				idEmpleado: idEmpleado.value,
				nombre: nombre.value,
				telefono: telefono.value,
				documento: documento.value,
				nuevaClave: nuevaClave.value
			});
			// Aquí iría la llamada AJAX o fetch cuando esté listo el backend.
		} else {
			console.warn('Errores de validación:');
			errores.forEach(error => console.warn(error));
			console.log('No se envía el formulario.');
		}
	});
});
