// ConfirmarPedido.js
function getNombreTipoProducto(tipoProducto) {
	switch (tipoProducto) {
		case 1: return "Entrada";
		case 2: return "Segundo";
		case 3: return "Bebida";
		case 4: return "Postre";
		case 5: return "Guarnición";
		default: return "Desconocido";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const params = new URLSearchParams(window.location.search);
	const pedidoId = params.get("pedidoId");
	const empleadoIdInput = document.getElementById("empleado-id");
	const claveEmpleadoInput = document.getElementById("empleado-clave");
	const direccionEntregaInput = document.getElementById("direccion-entrega");
	const mesaSelect = document.getElementById("mesaSelect");

	const API_URL_CONFIRMAR = "/mesalista/api/pedido/confirmar";
	const API_MESA = "/mesalista/api/mesa?estado=";

	var cliente_id = null;

	fetch(API_MESA + "1")
		.then(response => {
			if (!response.ok) {
				throw new Error("Error al obtener las mesas");
			}
			return response.json();
		})
		.then(mesas => {
			// Limpiar cualquier opción previa
			mesaSelect.innerHTML = "";

			if (mesas.length === 0) {
				const option = document.createElement("option");
				option.textContent = "-No hay mesas disponibles-";
				option.disabled = true;
				option.selected = true;
				mesaSelect.appendChild(option);

				mesaSelect.disabled = true;
			} else {
				mesaSelect.disabled = false;

				const placeholder = document.createElement("option");
				placeholder.textContent = "Selecciona una mesa";
				placeholder.value = "";
				placeholder.selected = true;
				placeholder.disabled = true;
				mesaSelect.appendChild(placeholder);

				mesas.forEach(mesa => {
					const option = document.createElement("option");
					option.value = mesa.id;
					option.textContent = mesa.mesa;
					mesaSelect.appendChild(option);
				});
			}
		})
		.catch(error => {
			console.error("Error al cargar las mesas:", error);
		});


	if (pedidoId) {
		const detalleUrl = `/mesalista/api/detallepedido/buscaractivo/${pedidoId}`;
		const pedidoUrl = `/mesalista/api/pedido/${pedidoId}`;

		fetch(detalleUrl)
			.then(res => res.json())
			.then(data => {
				const tbody = document.getElementById("detalle-body");
				tbody.innerHTML = "";
				let total = 0;

				data.forEach(detalle => {
					//console.log(detalle)
					if (detalle.cantidad <= 0) return;

					const fila = document.createElement("tr");
					const subtotal = detalle.cantidad * detalle.precioUnitario;
					total += subtotal;

					const comentarioTexto = detalle.comentario || "";

					const comentarioHTML = comentarioTexto
						? `<span class="comentario-texto">${escapeHtml(comentarioTexto)}</span> 
                           <a href="#" class="editar-comentario" data-id="${detalle.id}" style="margin-left: 5px;">✏️</a> 
                           <a href="#" class="eliminar-comentario" data-id="${detalle.id}" style="color:red; margin-left: 5px;">❌</a>`
						: `<button type="button" class="agregar-comentario" data-id="${detalle.id}">+</button>`;

					fila.innerHTML = `
                        <td style="font-size: 15px;">${getNombreTipoProducto(detalle.producto.tipoProducto)}</td>
                        <td style="width: 55px;">${detalle.cantidad}</td>
                        <td>${escapeHtml(detalle.producto.nombre)}</td>
                        <td>S/ ${detalle.precioUnitario.toFixed(2)}</td>
                        <td>S/ ${subtotal.toFixed(2)}</td>
                        <td class="comentario-cell" data-id="${detalle.id}">
                            ${comentarioHTML}
                        </td>
                    `;
					tbody.appendChild(fila);
				});

				document.getElementById("total-pedido").textContent = ` S/${total.toFixed(2)}`;
			})
			.catch(err => {
				mostrarPopupConfirmacion("error", "Error al obtener detalles del pedido: " + err.message, null);
			});

		fetch(pedidoUrl)
			.then(res => res.json())
			.then(pedido => {
				const clienteId = pedido.cliente?.id;
				cliente_id = clienteId;
				if (clienteId) {
					fetch(`/mesalista/api/cliente/${clienteId}`)
						.then(res => res.json())
						.then(cliente => {
							if (cliente.direccion) {
								direccionEntregaInput.placeholder = cliente.direccion;
							}
						})
						.catch(err => mostrarPopupConfirmacion("error", "Error al obtener detalles del cliente: " + err.message, null));
				}
			})
			.catch(err => mostrarPopupConfirmacion("error", "Error al obtener datos del pedido: " + err.message, null));
	} else {
		mostrarPopupConfirmacion("warning", "No se encontró el ID del pedido en la URL", null);
	}

	function escapeHtml(text) {
		return text.replace(/[&<>"']/g, function(m) {
			return ({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;'
			})[m];
		});
	}

	function actualizarCeldaComentario(cell, detalleId, comentarioTexto) {
		if (comentarioTexto) {
			cell.innerHTML = `
                <span class="comentario-texto">${escapeHtml(comentarioTexto)}</span> 
                <a href="#" class="editar-comentario" data-id="${detalleId}">✏️</a> 
                <a href="#" class="eliminar-comentario" data-id="${detalleId}" style="color:red;">❌</a>
            `;
		} else {
			cell.innerHTML = `<button type="button" class="agregar-comentario" data-id="${detalleId}">+</button>`;
		}
	}

	let peticionEnCurso = false;

	document.addEventListener("click", function(event) {
		const target = event.target;

		if (peticionEnCurso) return;

		// Eliminar comentario
		if (target.classList.contains("eliminar-comentario")) {
			event.preventDefault();
			const detalleId = target.dataset.id;
			const cell = target.closest(".comentario-cell");

			peticionEnCurso = true;

			fetch(`/mesalista/api/detallepedido/comentario/${detalleId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ comentario: "" })
			})
				.then(res => {
					if (!res.ok) throw new Error("Error al eliminar comentario");
					return res.json();
				})
				.then(data => {
					actualizarCeldaComentario(cell, detalleId, data.comentario || "");
				})
				.catch(err => mostrarPopupConfirmacion("error", err.message, null))
				.finally(() => {
					peticionEnCurso = false;
				});
		}


		if (target.classList.contains("agregar-comentario") || target.classList.contains("editar-comentario")) {
			event.preventDefault();

			const detalleId = target.dataset.id;
			const cell = target.closest(".comentario-cell");

			// Bloquear nuevas peticiones durante la edición
			if (cell.classList.contains('editando')) return;
			cell.classList.add('editando');

			// Obtener comentario actual
			const comentarioActual = cell.querySelector(".comentario-texto")?.textContent || "";
			let nuevoComentario = comentarioActual;

			// Crear campo de edición
			cell.innerHTML = `
		        <input type="text" class="comentario-input" maxlength="60" 
		               value="${escapeHtml(comentarioActual)}" />
		        <button class="comentario-ok">✔</button>
		        <small class="comentario-contador">
		            ${60 - comentarioActual.length} caracteres restantes
		        </small>
		    `;

			const input = cell.querySelector(".comentario-input");
			const okBtn = cell.querySelector(".comentario-ok");
			const contador = cell.querySelector(".comentario-contador");

			// Enfocar el campo de texto automáticamente
			input.focus();

			// Actualizar contador
			const actualizarContador = () => {
				contador.textContent = `${60 - input.value.length} caracteres restantes`;
			};
			input.addEventListener('input', actualizarContador);

			// Función para finalizar edición
			const finalizarEdicion = (comentario) => {
				cell.classList.remove('editando');
				actualizarCeldaComentario(cell, detalleId, comentario);
				document.removeEventListener('click', clickFueraHandler);
			};

			// Función para cancelar edición
			const cancelarEdicion = () => {
				finalizarEdicion(comentarioActual);
			};

			// Función para confirmar edición
			const confirmarEdicion = async () => {
				nuevoComentario = input.value.trim();
				peticionEnCurso = true;

				try {
					const response = await fetch(`/mesalista/api/detallepedido/comentario/${detalleId}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ comentario: nuevoComentario })
					});

					if (!response.ok) throw new Error("Error al guardar comentario");
					const data = await response.json();

					// Actualizar UI con la respuesta del servidor
					finalizarEdicion(data.comentario || "");

				} catch (error) {
					console.error("Error al guardar comentario:", error);
					mostrarPopupConfirmacion("error", error.message, null);
					cancelarEdicion();
				} finally {
					peticionEnCurso = false;
				}
			};

			// Eventos
			okBtn.addEventListener('click', confirmarEdicion);

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') confirmarEdicion();
				if (e.key === 'Escape') cancelarEdicion();
			});

			// Manejador de clic fuera (mejorado)
			const clickFueraHandler = (e) => {
				if (!cell.contains(e.target) && !peticionEnCurso) {
					confirmarEdicion(); // Confirmar cambios en lugar de cancelar
				}
			};

			setTimeout(() => document.addEventListener('click', clickFueraHandler), 100);
		}

	});

	document.getElementById("btn-confirmar-final").addEventListener("click", () => {
		const empleadoId = empleadoIdInput.value;
		const claveEmpleado = claveEmpleadoInput.value;
		const direccionEntrega = direccionEntregaInput.value || "";
		const paraLlevar = document.getElementById("modoCheckbox").checked;
		const mesaSelect = document.getElementById("mesaSelect");
		const mesaId = mesaSelect.value;

		if (!pedidoId || !empleadoId || !claveEmpleado) {
			mostrarPopupConfirmacion("warning", "Faltan datos necesarios: Pedido, Empleado o Clave.", null);
			return;
		}

		const formData = new URLSearchParams();
		formData.append("pedidoId", pedidoId);
		formData.append("empleadoId", empleadoId);
		formData.append("clave", claveEmpleado);
		formData.append("paraLlevar", paraLlevar.toString());

		if (direccionEntrega.trim()) {
			formData.append("direccionEntrega", direccionEntrega);
		}

		// Solo enviar mesaId si no es para llevar y hay una mesa válida seleccionada
		if (!paraLlevar && mesaId && mesaId !== "0") {
			formData.append("mesaId", mesaId);
		}

		fetch(API_URL_CONFIRMAR, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		})
			.then(async response => {
				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(errorText);
				}
				return response.text();
			})
			.then(message => {
				mostrarPopupConfirmacion("success", message, () => {
					localStorage.clear();
					window.location.href = "/mesalista";
				});
			})
			.catch(err => {
				mostrarPopupConfirmacion("error", "Error: " + err.message, null);
			});
	});

});

document.getElementById("btn-regresar").addEventListener("click", function() {
	window.history.back();
});


document.getElementById("modoCheckbox").addEventListener("change", (event) => {
	const mesaSelect = document.getElementById("mesaSelect");

	if (event.target.checked) {
		mesaSelect.selectedIndex = 0;
	}
});

document.getElementById("mesaSelect").addEventListener("change", (event) => {
	const modoCheckbox = document.getElementById("modoCheckbox");

	if (event.target.selectedIndex > 0) {
		modoCheckbox.checked = false;
	}
});





