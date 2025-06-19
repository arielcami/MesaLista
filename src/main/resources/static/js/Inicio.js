document.addEventListener('DOMContentLoaded', function() {
	const nombreInput = document.getElementById('nombre');
	const documentoInput = document.getElementById('documento');

	// Limpieza cruzada entre campos
	nombreInput.addEventListener('input', function() {
		if (this.value.trim().length > 0) {
			documentoInput.value = '';
		}
	});

	documentoInput.addEventListener('input', function() {
		if (this.value.trim().length > 0) {
			nombreInput.value = '';
		}
	});

	// Manejo de selección de cliente
	const radios = document.querySelectorAll('input[name="clienteSeleccionado"]');
	const btnTomarPedido = document.getElementById('btnTomarPedido');
	let clienteSeleccionadoId = null;

	if (btnTomarPedido && radios.length > 0) {
		radios.forEach(radio => {
			radio.addEventListener('change', function() {
				clienteSeleccionadoId = this.value;
				btnTomarPedido.style.display = 'inline-block';
			});
		});

		btnTomarPedido.addEventListener('click', function() {
			if (clienteSeleccionadoId) {
				localStorage.clear();
				window.location.href = '/mesalista/cliente/pedido/nuevo/' + clienteSeleccionadoId;
			} else {
				mostrarPopupConfirmacion("warning", "Por favor, selecciona un cliente.");
			}
		});
	}

	// Mostrar alerta si no hubo resultados (desde Thymeleaf)
	if (window._sinResultados === true) {
		mostrarPopupConfirmacion("error", "No se encontraron resultados con los criterios de búsqueda.");
	}
});

// Validación del formulario
function validarFormulario() {
	const nombre = document.getElementById('nombre').value.trim();
	const documento = document.getElementById('documento').value.trim();

	if (nombre === '' && documento === '') {
		mostrarPopupCustom("error", "Por favor, ingrese al menos un nombre o un documento para buscar.");
		return false;
	}

	return true;
}

// Validación de selección (usado si se implementa en otros contextos)
function validarSeleccion() {
	const seleccionado = document.querySelector('input[name="clienteSeleccionado"]:checked');
	if (!seleccionado) {
		mostrarPopupCustom("warning", "Por favor, seleccione un cliente antes de continuar.");
	}
	return true;
}

// Redirección directa
function redirigirAPaginaPrincipal() {
	window.location.href = '/mesalista/';
}
