document.addEventListener("DOMContentLoaded", () => {
	const params = new URLSearchParams(window.location.search);
	const pedidoId = params.get("pedidoId");
	const empleadoIdInput = document.getElementById("empleado-id");
	const claveEmpleadoInput = document.getElementById("empleado-clave");
	const direccionEntregaInput = document.getElementById("direccion-entrega");

	const API_URL_CONFIRMAR = "/mesalista/api/pedido/confirmar";

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
					if (detalle.cantidad <= 0) return;

					const fila = document.createElement("tr");
					const subtotal = detalle.cantidad * detalle.precioUnitario;
					total += subtotal;

					const comentarioTexto = detalle.comentario || "";

					const comentarioHTML = comentarioTexto
						? `<span>${escapeHtml(comentarioTexto)}</span> 
               <a href="#" class="editar-comentario" data-id="${detalle.id}" style="margin-left: 5px;">✏️</a> 
               <a href="#" class="eliminar-comentario" data-id="${detalle.id}" style="color:red; margin-left: 5px;">❌</a>`
						: `<button type="button" class="agregar-comentario" data-id="${detalle.id}">+</button>`;

					fila.innerHTML = `
            <td style="width: 90px;">${detalle.cantidad}</td>
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

	// Función para escapar texto y prevenir inyección HTML
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

	// Función para actualizar el contenido de la celda de comentario
	function actualizarCeldaComentario(cell, detalleId, comentarioTexto) {
		if (comentarioTexto) {
			cell.innerHTML = `
        <span>${escapeHtml(comentarioTexto)}</span> 
        <a href="#" class="editar-comentario" data-id="${detalleId}" style="margin-left: 5px;">✏️</a> 
        <a href="#" class="eliminar-comentario" data-id="${detalleId}" style="color:red; margin-left: 5px;">❌</a>
      `;
		} else {
			cell.innerHTML = `<button type="button" class="agregar-comentario" data-id="${detalleId}">+</button>`;
		}
	}

	// Variable para controlar estado de edición y evitar cierres prematuros
	let peticionEnCurso = false;

	// Manejador de clicks para comentarios
	document.addEventListener("click", function(event) {
		const target = event.target;

		// Evitar acción si hay petición en curso para evitar conflictos UI
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

		// Agregar o editar comentario
		if (target.classList.contains("agregar-comentario") || target.classList.contains("editar-comentario")) {
			event.preventDefault();
			const detalleId = target.dataset.id;
			const cell = target.closest(".comentario-cell");

			// Obtener texto actual del comentario si existe
			const span = cell.querySelector("span");
			let valorActual = span ? span.textContent : "";

			// Mostrar input con contador
			cell.innerHTML = `
        <input type="text" class="comentario-input" maxlength="60" value="${escapeHtml(valorActual)}" autofocus />
        <button class="comentario-ok">Ok</button>
        <small class="comentario-contador" style="display:block;font-size:12px;color:gray;margin-top:3px;">
          ${60 - valorActual.length} caracteres restantes
        </small>
      `;

			const input = cell.querySelector(".comentario-input");
			const okBtn = cell.querySelector(".comentario-ok");
			const contador = cell.querySelector(".comentario-contador");

			// Actualizar contador en tiempo real
			input.addEventListener("input", () => {
				const restante = 60 - input.value.length;
				contador.textContent = `${restante} caracteres restantes`;
			});

			// Función para cerrar el campo de edición
			const cerrarCampo = (comentarioTexto) => {
				actualizarCeldaComentario(cell, detalleId, comentarioTexto);
			};

			// Guardar comentario al hacer click en Ok
			okBtn.addEventListener("click", () => {
				const nuevoComentario = input.value.trim().substring(0, 60);
				peticionEnCurso = true;
				okBtn.disabled = true;
				input.disabled = true;

				fetch(`/mesalista/api/detallepedido/comentario/${detalleId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ comentario: nuevoComentario })
				})
					.then(res => {
						if (!res.ok) throw new Error("Error al guardar comentario");
						return res.json();
					})
					.then(data => {
						valorActual = data.comentario || "";
						cerrarCampo(valorActual);
					})
					.catch(err => {
						mostrarPopupConfirmacion("error", err.message, null);
						cerrarCampo(valorActual); // cerramos con valor previo para evitar bloqueos UI
					})
					.finally(() => {
						peticionEnCurso = false;
						okBtn.disabled = false;
						input.disabled = false;
					});
			});

			// Manejar Enter y Escape en input
			input.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					okBtn.click();
				} else if (e.key === "Escape") {
					e.preventDefault();
					cerrarCampo(valorActual);
				}
			});

			// Listener para cerrar el campo al hacer click afuera, con debounce para evitar cierre prematuro
			const clickFueraHandler = (e) => {
				if (peticionEnCurso) return;

				if (!cell.contains(e.target)) {
					document.removeEventListener("click", clickFueraHandler);
					cerrarCampo(valorActual);
				}
			};
			setTimeout(() => {
				document.addEventListener("click", clickFueraHandler);
			}, 150);
		}
	});

	// Confirmar pedido
	document.getElementById("btn-confirmar-final").addEventListener("click", () => {
		const empleadoId = empleadoIdInput.value;
		const claveEmpleado = claveEmpleadoInput.value;
		const direccionEntrega = direccionEntregaInput.value || "";

		if (!pedidoId || !empleadoId || !claveEmpleado) {
			mostrarPopupConfirmacion("warning", "Faltan datos necesarios: Pedido, Empleado o Clave.", null);
			return;
		}

		const formData = new URLSearchParams();
		formData.append("pedidoId", pedidoId);
		formData.append("empleadoId", empleadoId);
		formData.append("clave", claveEmpleado);
		if (direccionEntrega.trim()) {
			formData.append("direccionEntrega", direccionEntrega);
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
					window.location.href = "/mesalista";
				});
			})
			.catch(err => {
				mostrarPopupConfirmacion("error", "Error: " + err.message, null);
			});
	});
});

// Botón regresar
document.getElementById("btn-regresar").addEventListener("click", function() {
	window.history.back();
});
