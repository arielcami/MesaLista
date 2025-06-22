// CrearCliente.js
document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("form-crear-cliente");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Capturar valores de los inputs individualmente
		const nombre = document.getElementById("nombre").value.trim();
		const telefono = document.getElementById("telefono").value.trim();
		const documento = document.getElementById("documento").value.trim();
		const direccion = document.getElementById("direccion").value.trim();
		const cliente = { nombre, telefono, documento, direccion };

		mostrarPopupConfirmacion("question", "¿Deseas crear este cliente?", async () => {
			try {
				const response = await fetch("/mesalista/api/cliente/addcliente_sp", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(cliente)
				});

				if (response.ok) {
					const result = await response.json();

					if (result.created) {
						mostrarPopupConfirmacion("success", result.msg + " " + cliente.nombre, async () => {
							form.reset();

							try {
								const resCliente = await fetch(`/mesalista/api/cliente/buscar-documento/${encodeURIComponent(cliente.documento)}`);
								if (!resCliente.ok) throw new Error("No se pudo obtener el cliente recién creado.");

								const clienteRecuperado = await resCliente.json();

								mostrarPopupConfirmacion("question", `¿Tomar pedido a ${cliente.nombre} ahora?`, () => {
									window.location.href = `/mesalista/cliente/pedido/nuevo/${clienteRecuperado.id}`;
								}, () => {
									console.log("El usuario decidió no tomar pedido ahora.");
								});

							} catch (err) {
								console.error("Error al recuperar cliente:", err);
								mostrarPopupConfirmacion("error", "No se pudo obtener el cliente recién creado.", null, null);
							}

						}, null);
					}

				} else {
					const errorText = await response.text();
					mostrarPopupConfirmacion("error", `Error al crear el cliente: ${errorText}`, null, null);
				}
			} catch (err) {
				mostrarPopupConfirmacion("error", "Error de conexión con el servidor.", null, null);
			}
		}, () => {
			// Cancelación, no hacer nada
		});
	});
});
