document.addEventListener('DOMContentLoaded', () => {
	const modalAccionesPedido = document.getElementById('modal-acciones-pedido-delivery');
	const btnPedidoEntregadoPagado = document.getElementById('btn-pedido-entregado-pagado');
	const btnPedidoNoEntregado = document.getElementById('btn-pedido-no-entregado');
	const btnReportarIncidente = document.getElementById('btn-reportar-incidente-pedido');
	const btnCerrarModalAcciones = document.getElementById('btn-cerrar-modal-acciones-pedido');

	// Variables para guardar el pedido y delivery activos
	let pedidoActualId = null;
	let deliveryActualId = null;

	function mostrarModalAccionesPedido(pedidoId, deliveryId) {
		pedidoActualId = pedidoId;
		deliveryActualId = deliveryId;
		modalAccionesPedido.style.display = 'flex';
		console.log(`[Modal] Mostrando opciones finales del pedido ${pedidoId} para delivery ${deliveryId}.`);
	}

	function cerrarModalAccionesPedido() {
		modalAccionesPedido.style.display = 'none';
		console.log('[Modal] Cerrando opciones finales del pedido.');
	}

	// Función para llamar al endpoint PUT para actualizar estado
	async function actualizarEstadoPedido(nuevoEstado) {
		if (!pedidoActualId || !deliveryActualId) {
			console.error('Pedido o Delivery no definidos');
			return;
		}
		try {
			const response = await fetch(`/mesalista/api/pedido/actualizarEstadoEnTransito/${pedidoActualId}/${deliveryActualId}/${nuevoEstado}`, {
				method: 'PUT'
			});
			if (response.ok) {
				console.log(`[Acción] Estado del pedido ${pedidoActualId} actualizado a ${nuevoEstado}`);
				cerrarModalAccionesPedido();
				// Aquí puedes refrescar la lista o actualizar la UI si quieres
			} else {
				console.error('Error al actualizar estado', response.status);
			}
		} catch (error) {
			console.error('Error en fetch:', error);
		}
	}

	btnPedidoEntregadoPagado.addEventListener('click', async () => {
		const confirmar = confirm('¿Confirmas la entrega correcta de este pedido?');
		if (confirmar) {
			await actualizarEstadoPedido(4);
			cargarPedidosPorDeliveryYEstado(deliveryActualId, 4);
		} else {
			console.log('Acción cancelada por el usuario.');
		}
	});

	btnPedidoNoEntregado.addEventListener('click', async () => {
		const confirmar = confirm('¿Confirmas que el pedido NO fue entregado?');
		if (confirmar) {
			await actualizarEstadoPedido(5);
			cargarPedidosPorDeliveryYEstado(deliveryActualId, 5);
		} else {
			console.log('Acción cancelada por el usuario.');
		}
	});

	btnReportarIncidente.addEventListener('click', async () => {
		const confirmar = confirm('¿Confirmas que deseas reportar un incidente para este pedido?');
		if (confirmar) {
			await actualizarEstadoPedido(6);
			cargarPedidosPorDeliveryYEstado(deliveryActualId, 6);
		} else {
			console.log('Acción cancelada por el usuario.');
		}
	});



	btnCerrarModalAcciones.addEventListener('click', () => {
		console.log('[Modal] Cierre manual del modal de acciones.');
		cerrarModalAccionesPedido();
	});

	window.MostrarModalAccionesPedidoDelivery = mostrarModalAccionesPedido;
});
