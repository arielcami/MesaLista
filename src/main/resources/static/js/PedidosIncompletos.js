document.addEventListener("DOMContentLoaded", function() {
	const lista = document.getElementById("listaPedidosIncompletos");
	const btnAbrirModal = document.getElementById("btnPedidosIncompletos");
	const modal = document.getElementById("modalPedidosIncompletos");
	const btnCerrar = document.getElementById("cerrarModalPedidosIncompletos");

	btnAbrirModal?.addEventListener("click", async function() {
		modal.style.display = "block";
		await cargarPedidosIncompletos();
	});

	btnCerrar?.addEventListener("click", function() {
		modal.style.display = "none";
		lista.innerHTML = ""; // Limpiar lista
	});

	window.addEventListener("click", function(event) {
		if (event.target === modal) {
			modal.style.display = "none";
			lista.innerHTML = "";
		}
	});

	lista.addEventListener("click", async function(e) {
		if (e.target.classList.contains("btn-continuar-pedido")) {
			const pedidoId = e.target.dataset.pedidoId;
			try {
				const resPedido = await fetch(`/mesalista/api/pedido/${pedidoId}`);
				const pedido = await resPedido.json();

				const resDetalles = await fetch(`/mesalista/api/detallepedido/buscaractivo/${pedidoId}`);
				const detalles = await resDetalles.json();

				localStorage.setItem("pedido_id", pedidoId);
				const carrito = {};
				const clienteId = pedido.cliente.id.toString();
				carrito[clienteId] = {};

				detalles.forEach(detalle => {
					const tipo = detalle.producto.tipoProducto.toString();
					if (!carrito[clienteId][tipo]) carrito[clienteId][tipo] = {};
					carrito[clienteId][tipo][detalle.producto.id] = detalle.cantidad;
				});

				localStorage.setItem("carrito", JSON.stringify(carrito));
				window.location.href = `/mesalista/cliente/pedido/nuevo/${clienteId}`;
			} catch (err) {
				mostrarPopupConfirmacion("error", "Error al continuar el pedido: " + err.message);
			}
		}

		if (e.target.classList.contains("btn-eliminar-pedido")) {
			const pedidoId = e.target.dataset.pedidoId;

			mostrarPopupConfirmacion("question","¿Deseas eliminar este pedido incompleto?",
				async function () {
					try {
						await fetch(`/mesalista/api/pedido/limpiar-basura/${pedidoId}`, { method: "DELETE" });
						e.target.closest(".item-pedido-incompleto").remove();
						mostrarPopupConfirmacion("success", "Pedido eliminado correctamente.");
					} catch (err) {
						mostrarPopupConfirmacion("error", "Error al eliminar el pedido.");
					}
				},
				function () {
					//console.log("Eliminación cancelada por el usuario.");
				}
			);
		}
	});

	async function cargarPedidosIncompletos() {
		try {
			const res = await fetch("/mesalista/api/pedido/incompletos");
			const pedidos = await res.json();

			if (pedidos.length === 0) {
				lista.innerHTML = "<p>No hay pedidos incompletos.</p>";
				return;
			}

			lista.innerHTML = "";
			pedidos.forEach(pedido => {
				const item = document.createElement("div");
				item.classList.add("item-pedido-incompleto");
				let totalFormateado = pedido.total.toFixed(2);
				item.innerHTML = `
					<span><strong>Pedido ID</strong>: ${pedido.id} - <strong>Cliente:</strong> ${pedido.cliente.nombre} - <strong>Valor:</strong> S/ ${totalFormateado}</span>
					<div>
						<button class="btn-continuar-pedido" data-pedido-id="${pedido.id}">Continuar Pedido</button>
						<button class="btn-eliminar-pedido" data-pedido-id="${pedido.id}">Eliminar</button>
					</div>
				`;
				lista.appendChild(item);
			});
		} catch (err) {
			mostrarPopupConfirmacion("error", "Error al cargar los pedidos incompletos.");
		}
	}
});
