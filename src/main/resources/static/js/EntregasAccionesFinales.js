document.addEventListener('DOMContentLoaded', () => {
	const modalAccionesPedido = document.getElementById('modal-acciones-pedido-delivery');
	const btnPedidoEntregadoPagado = document.getElementById('btn-pedido-entregado-pagado');
	const btnPedidoNoEntregado = document.getElementById('btn-pedido-no-entregado');
	const btnReportarIncidente = document.getElementById('btn-reportar-incidente-pedido');
	const btnCerrarModalAcciones = document.getElementById('btn-cerrar-modal-acciones-pedido');

	let pedidoActualId = null;
	let deliveryActualId = null;

	function mostrarModalAccionesPedido(pedidoId, deliveryId) {
		pedidoActualId = pedidoId;
		deliveryActualId = deliveryId;
		localStorage.setItem('pedidoId', pedidoId);
		modalAccionesPedido.style.display = 'flex';
		// console.log(`[Modal] Mostrando opciones finales del pedido ${pedidoId} para delivery ${deliveryId}.`);
	}

	function cerrarModalAccionesPedido() {
		modalAccionesPedido.style.display = 'none';
		// console.log('[Modal] Cerrando opciones finales del pedido.');
	}

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
				// console.log(`[Acción] Estado del pedido ${pedidoActualId} actualizado a ${nuevoEstado}`);
				cerrarModalAccionesPedido();
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
		}
	});

	btnPedidoNoEntregado.addEventListener('click', async () => {
		const confirmar = confirm('¿Confirmas que el pedido NO fue entregado?');
		if (confirmar) {
			await actualizarEstadoPedido(5);
			cargarPedidosPorDeliveryYEstado(deliveryActualId, 5);
		}
	});

	btnCerrarModalAcciones.addEventListener('click', () => {
		cerrarModalAccionesPedido();
	});

	// -------------------- Modal de Reportar Incidente --------------------
	const modalIncidente = document.getElementById('modal-reportar-incidente');
	const btnCerrarIncidente = document.getElementById('btn-cerrar-incidente');
	const btnEnviarIncidente = document.getElementById('btn-enviar-incidente');

	function mostrarModalIncidente() {
		modalIncidente.style.display = 'flex';
		// console.log('[Modal] Mostrando modal de incidente');
	}

	function cerrarModalIncidente() {
		modalIncidente.style.display = 'none';
		// console.log('[Modal] Cerrando modal de incidente');
	}

	btnReportarIncidente.addEventListener('click', () => {
		cerrarModalAccionesPedido();
		mostrarModalIncidente();
	});

	btnCerrarIncidente.addEventListener('click', () => {
		// console.log('[Botón] Click en cancelar incidente');
		cerrarModalIncidente();
	});

	btnEnviarIncidente.addEventListener('click', async () => {
		const btn = btnEnviarIncidente;
		btn.disabled = true;
		btn.textContent = 'Enviando...';

		const ubicacion = document.getElementById('input-ubicacion').value.trim();
		const descripcion = document.getElementById('input-incidente').value.trim();
		const deliveryId = localStorage.getItem('id_de_empleado_delivery');
		const pedidoId = localStorage.getItem('pedidoId');

		if (!ubicacion || !descripcion) {
			alert('Por favor completa todos los campos.');
			btn.disabled = false;
			btn.textContent = 'Enviar Reporte';
			return;
		}

		try {
			// Enviar el incidente
			const response = await fetch('/mesalista/api/incidente', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					delivery: { id: deliveryId },
					pedido: { id: pedidoId },
					ubicacion: ubicacion,
					estado: 1,
					incidente: descripcion
				})
			});

			if (response.ok) {
				console.log('[Incidente] Reportado correctamente. Ahora se actualizará el estado del pedido...');

				// Marcar el pedido con estado 6 (Incidente)
				const actualizarEstado = await fetch(`/mesalista/api/pedido/marcarEstado/${pedidoId}?estado=6`, {
					method: 'PUT'
				});

				if (actualizarEstado.ok) {
					alert('Incidente reportado y pedido marcado como incidente.');
					cerrarModalIncidente();
					cargarPedidosPorDeliveryYEstado(deliveryId, 6);
				} else {
					alert('Incidente enviado pero no se pudo actualizar el estado del pedido.');
					btn.disabled = false;
					btn.textContent = 'Enviar Reporte';
				}
			} else {
				const error = await response.json();
				alert(`Error: ${error.message || 'No se pudo reportar el incidente'}`);
				btn.disabled = false;
				btn.textContent = 'Enviar Reporte';
			}
		} catch (error) {
			console.error('Error al enviar incidente:', error);
			alert('Error al enviar el incidente. Intenta más tarde.');
			btn.disabled = false;
			btn.textContent = 'Enviar Reporte';
		}
	});

	// Bloquear cierre al hacer clic fuera del contenido del modal
	modalIncidente.addEventListener('click', (e) => {
		const contenido = document.querySelector('.modal-content-incidente');
		if (!contenido.contains(e.target)) {
			// console.log('[Modal] Click afuera del modal. No se cerrará.');
			e.stopPropagation(); // No hacer nada
		}
	});

	window.MostrarModalAccionesPedidoDelivery = mostrarModalAccionesPedido;
});
