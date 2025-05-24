

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

		// Cargar detalles del pedido
		fetch(detalleUrl)
			.then(res => res.json())
			.then(data => {
				const tbody = document.getElementById("detalle-body");
				tbody.innerHTML = "";

				let total = 0;

				data.forEach(detalle => {
					const fila = document.createElement("tr");
					const subtotal = detalle.cantidad * detalle.precioUnitario;
					total += subtotal;

					fila.innerHTML = `
                        <td style="width: 90px;">${detalle.cantidad}</td>
                        <td>${detalle.producto.nombre}</td>
                        <td>S/ ${detalle.precioUnitario.toFixed(2)}</td>
                        <td>S/ ${subtotal.toFixed(2)}</td>
                    `;
					tbody.appendChild(fila);
				});

				document.getElementById("total-pedido").textContent = ` S/${total.toFixed(2)}`;
			})
			.catch(err => {
				//console.error("Error al obtener detalles del pedido:", err)
				mostrarPopupConfirmacion("error", "Error al obtener detalles del pedido: " + toString(err), null);
			}
			);

		// Obtener clienteId desde el pedido
		fetch(pedidoUrl)
			.then(res => res.json())
			.then(pedido => {
				const clienteId = pedido.cliente?.id;
				if (clienteId) {
					// Obtener dirección desde el cliente
					fetch(`/mesalista/api/cliente/${clienteId}`)
						.then(res => res.json())
						.then(cliente => {
							if (cliente.direccion) {
								direccionEntregaInput.placeholder = cliente.direccion;
							}
						})
						.catch(err => mostrarPopupConfirmacion("error", "Error al obtener detalles del cliente: " + toString(err)), null);
				}
			})
			.catch(err => mostrarPopupConfirmacion("error", "Error al obtener datos del pedido: " + toString(err)), null);
	} else {
		//console.warn("No se encontró el pedidoId en la URL");
		mostrarPopupConfirmacion("warning", "No se encontró el ID del pedido en la URL", null);
	}

	document.getElementById("btn-confirmar-final").addEventListener("click", () => {
		const empleadoId = empleadoIdInput.value;
		const claveEmpleado = claveEmpleadoInput.value;
		const direccionEntrega = direccionEntregaInput.value || "";

		if (!pedidoId || !empleadoId || !claveEmpleado) { // <- validamos también clave
			mostrarPopupConfirmacion("warning", "Faltan datos necesarios: Pedido, Empleado o Clave.", null);
			return;
		}

		const formData = new URLSearchParams();
		formData.append("pedidoId", pedidoId);
		formData.append("empleadoId", empleadoId);
		formData.append("clave", claveEmpleado); // <- NUEVO
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
				localStorage.clear();
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




