// Modal Detalle Pedido
const modalDetalle = document.getElementById('modal-detalle-pedido-entrega');
const btnCerrarDetalle = document.getElementById('modal-detalle-pedido-entrega-close');
const contenedorDetalle = document.getElementById('detalle-pedido-lista');
const ENDPOINT = '/mesalista/api/detallepedido/pedido/';


window.abrirModalDetallePedido = function(idPedido) {
	contenedorDetalle.innerHTML = '<p>Cargando detalles...</p>';
	modalDetalle.style.display = 'flex';

	fetch(ENDPOINT + idPedido)
		.then(res => {
			if (!res.ok) throw new Error('Error en la respuesta del servidor');
			return res.json();
		})
		.then(data => {
			if (!data || data.length === 0) {
				contenedorDetalle.innerHTML = '<p>No hay detalles para este pedido.</p>';
				return;
			}

			let totalPedido = 0;
			let htmlDetalle = `<h3>Detalle - Pedido ${idPedido}</h3><hr><div class="detalle-lista-productos">`;

			data.forEach(item => {
				if (item.cantidad === 0) return;

				const total = item.cantidad * item.precioUnitario;
				totalPedido += total;
				htmlDetalle += `
					<div class="detalle-item">
						<div class="detalle-izquierda">${item.cantidad} × ${item.producto?.nombre ?? 'N/D'}</div>
						<div class="detalle-derecha">S/ ${total.toFixed(2)}</div>
					</div>
				`;
			});

			htmlDetalle += `</div><hr><p class="detalle-total"><strong>Total: S/ ${totalPedido.toFixed(2)}</strong></p>`;
			contenedorDetalle.innerHTML = htmlDetalle;
		})
		.catch(err => {
			contenedorDetalle.innerHTML = `<p>Error cargando detalles: ${err.message}</p>`;
		});
}





// Cerrar modal al hacer click en X
btnCerrarDetalle.addEventListener('click', () => {
	modalDetalle.style.display = 'none';
});

// Cerrar modal si se clickea fuera del contenido
window.addEventListener('click', (event) => {
	if (event.target === modalDetalle) {
		modalDetalle.style.display = 'none';
	}
});
