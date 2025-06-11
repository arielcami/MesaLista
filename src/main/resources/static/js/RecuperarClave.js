document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('form');
	const mensajeBox = document.querySelector('.mensaje');
	const mensajeTexto = mensajeBox.querySelector('p');
	const boton = form.querySelector('button[type="submit"]');

	if (!form || !boton || !mensajeBox || !mensajeTexto) {
		console.error('Elementos requeridos no encontrados en el DOM');
		return;
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		// Limpiar mensajes anteriores
		mensajeBox.className = 'mensaje';
		mensajeTexto.textContent = '';
		mensajeBox.style.display = 'none';

		// Obtener campos
		const idEmpleado = form.querySelector('input[name="idEmpleado"]');
		const nombre = form.querySelector('input[name="nombre"]');
		const telefono = form.querySelector('input[name="telefono"]');
		const documento = form.querySelector('input[name="documento"]');
		const nuevaClave = form.querySelector('input[name="nuevaClave"]');
		const confirmarClave = form.querySelector('input[name="confirmarClave"]');

		// Validaciones
		let valido = true;
		const errores = [];

		if (!idEmpleado.value || isNaN(idEmpleado.value) || Number(idEmpleado.value) < 1) {
			errores.push('ID de empleado inválido');
			valido = false;
		}
		if (!nombre.value.trim()) errores.push('Nombre es requerido'), valido = false;
		if (!telefono.value.trim()) errores.push('Teléfono es requerido'), valido = false;
		if (!documento.value.trim()) errores.push('Documento es requerido'), valido = false;
		if (!nuevaClave.value || nuevaClave.value.length < 4) errores.push('Nueva contraseña debe tener al menos 4 caracteres'), valido = false;
		if (nuevaClave.value !== confirmarClave.value) errores.push('Las contraseñas no coinciden'), valido = false;

		if (!valido) {
			mensajeTexto.textContent = errores.join(' | ');
			mensajeBox.classList.add('error');
			mensajeBox.style.display = 'block';
			return;
		}

		// Desactivar botón mientras se envía
		boton.disabled = true;
		boton.textContent = 'Procesando...';

		const payload = {
			id: Number(idEmpleado.value),
			nombre: nombre.value.trim(),
			telefono: telefono.value.trim(),
			documento: documento.value.trim(),
			nuevaClave: nuevaClave.value
		};

		try {
			const response = await fetch('/mesalista/api/empleado/restablecer-clave', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (data.p_exito === true) {
				mensajeTexto.textContent = data.p_mensaje || 'Contraseña actualizada con éxito.';
				mensajeBox.classList.add('exito');
				mensajeBox.style.display = 'block';

				setTimeout(() => {
					history.back(); // Volver atrás después de éxito
				}, 2000);
			} else {
				mensajeTexto.textContent = data.p_mensaje || 'No se pudo actualizar la contraseña.';
				mensajeBox.classList.add('error');
				mensajeBox.style.display = 'block';
			}
		} catch (error) {
			console.error('Error en la solicitud:', error);
			mensajeTexto.textContent = 'Error al conectar con el servidor.';
			mensajeBox.classList.add('error');
			mensajeBox.style.display = 'block';
		} finally {
			boton.disabled = false;
			boton.textContent = 'Actualizar Contraseña';
		}
	});
});
