// CocinaControl.js
import { inicializarFiltroPedidos } from './FiltrosPedidos.js';

const API_URL = '/mesalista/api/pedido';

function estadoPedidoTexto(codigo) {
	const estados = {
		0: 'Inactivo',
		1: 'En preparación',
		2: 'Listo',
		3: 'En tránsito',
		4: 'Entregado',
		5: 'No entregado',
		6: 'Incidente',
		7: 'Devuelto',
		8: 'ERROR'
	};
	return estados[codigo] || 'Desconocido';
}

function formatHora(fechaISO) {
	const fecha = new Date(fechaISO);
	let horas = fecha.getHours();
	const minutos = fecha.getMinutes().toString().padStart(2, '0');
	const ampm = horas >= 12 ? 'PM' : 'AM';
	horas = horas % 12;
	horas = horas ? horas : 12; // 0 -> 12
	return `${horas}:${minutos} ${ampm}`;
}

function formatTelefono(telefono) {
	const limpio = telefono.replace(/\D/g, '');
	const grupos = [];
	for (let i = limpio.length; i > 0; i -= 3) {
		const inicio = Math.max(i - 3, 0);
		grupos.unshift(limpio.slice(inicio, i));
	}
	return grupos.join('-');
}

async function fetchPedidos() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			console.error('Error al obtener pedidos:', response.statusText);
			return;
		}

		const pedidos = await response.json();

		// Ordenar por fecha más antigua (usando fechaPedido si está confirmada, creadoEn si no)
		pedidos.sort((a, b) => {
			const fechaA = a.fechaPedido ? new Date(a.fechaPedido) : new Date(a.creadoEn);
			const fechaB = b.fechaPedido ? new Date(b.fechaPedido) : new Date(b.creadoEn);
			return fechaA - fechaB; // Más antiguos primero
		});

		renderPedidos(pedidos);
		inicializarFiltroPedidos(pedidos, renderPedidos);
	} catch (error) {
		console.error('Error de red o inesperado:', error);
	}
}

function renderPedidos(pedidos) {
	const container = document.querySelector('.pedido-container');
	container.innerHTML = '';

	pedidos.forEach(pedido => {
		const prioridad = [2, 1, 3, 4, 5];
		const detallesOrdenados = pedido.detalles
			.filter(detalle => detalle.cantidad > 0)
			.sort((a, b) => prioridad.indexOf(a.producto.tipoProducto) - prioridad.indexOf(b.producto.tipoProducto));

		const card = document.createElement('div');
		card.className = 'pedido-card';
		card.dataset.pedidoId = pedido.id;
		
		const mesa = pedido.mesa && pedido.mesa.nombre ? `<br>Mesa ${pedido.mesa.nombre}` : '';

		card.innerHTML = `
            <h2>Pedido #${pedido.id} - ${estadoPedidoTexto(pedido.estadoPedido)}${mesa}</h2>
			<p><strong>Modo:</strong> ${pedido.paraLlevar ? 'Para llevar' : 'Consumir aquí'}</p>
            <p><strong>Cliente:</strong> ${pedido.cliente.nombre} - ${pedido.cliente.documento}</p>
            <p><strong>Teléfono:</strong> ${formatTelefono(pedido.cliente.telefono)}</p>
            <p><strong>Dirección:</strong> ${pedido.direccionEntrega ?? 'Consumir aquí'}</p>
            <p><strong>Hora del pedido:</strong> ${formatHora(pedido.fechaPedido)}</p>
            <p><strong>Atendido por:</strong> ${pedido.empleado ? pedido.empleado.nombre : 'No asignado'}</p>

			${detallesOrdenados.map(detalle => `
				<div class="detalle-item">
				    <p>${detalle.cantidad} × ${detalle.producto.nombre}${detalle.comentario ? `  (${detalle.comentario})` : ''}</p>
				</div>
			`).join('')}
		`;

		card.addEventListener('click', () => {
			mostrarModal(pedido);
		});

		container.appendChild(card);
	});
}


/* === MODAL === */
const modal = document.getElementById('modal-acciones');

function mostrarModal(pedido) {
	modal.classList.remove('hidden');
	modal.dataset.pedidoId = pedido.id;

	const titulo = document.getElementById('modal-titulo');
	titulo.textContent = `Pedido #${pedido.id}: ${pedido.cliente.nombre}`;

	localStorage.setItem('clienteId', `${pedido.cliente.id}`);
}

// Cerrar modal si clic fuera
window.addEventListener('click', (e) => {
	if (e.target === modal) {
		modal.classList.add('hidden');
		localStorage.clear();
	}
});

// Cerrar modal con Escape
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		modal.classList.add('hidden');
		localStorage.clear();
	}
});

// Botones
document.getElementById('btn-listo').addEventListener('click', async () => {
	const id = modal.dataset.pedidoId;
	const estadoListo = 2;

	try {
		// 1. Marcar pedido como "listo"
		const response = await fetch(`${API_URL}/marcarEstado/${id}?estado=${estadoListo}`, {
			method: 'PUT'
		});

		if (!response.ok) {
			console.error('Error al actualizar pedido:', response.statusText);
		} else {
			// 2. Limpiar productos con cantidad = 0 del pedido
			await fetch(`/mesalista/api/detallepedido/limpiar-detalle/${id}`, {
				method: 'DELETE'
			});

			// 3. Recargar pedidos
			fetchPedidos();
		}
	} catch (error) {
		console.error('Error de red al actualizar pedido:', error);
	}

	modal.classList.add('hidden');
});

document.getElementById('btn-editar').addEventListener('click', () => {
	const id = modal.dataset.pedidoId;
	modal.classList.add('hidden');
	abrirModalEditar(id);
});

document.getElementById('btn-eliminar').addEventListener('click', async () => {
	const id = modal.dataset.pedidoId;
	const estadoEliminado = 0;

	try {
		const response = await fetch(`${API_URL}/marcarEstado/${id}?estado=${estadoEliminado}`, {
			method: 'PUT'
		});

		if (!response.ok) {
			console.error('Error al eliminar pedido:', response.statusText);
		} else {
			fetchPedidos();
		}
	} catch (error) {
		console.error('Error de red al eliminar pedido:', error);
	}

	modal.classList.add('hidden');
});


document.getElementById('btn-boton-refresh').addEventListener('click', async () => {
	try {
		// Mostrar estado de carga (opcional)
		const refreshButton = document.getElementById('btn-boton-refresh');
		refreshButton.disabled = true;
		refreshButton.textContent = 'Cargando...';

		await fetchPedidos();
		// Mostrar mensaje de éxito (opcional)
		console.log('Pedidos actualizados correctamente');
	} catch (error) {
		console.error('Error al actualizar pedidos:', error);
	} finally {
		// Restaurar el estado del botón
		const refreshButton = document.getElementById('btn-boton-refresh');
		refreshButton.disabled = false;
		refreshButton.textContent = 'Actualizar';
	}
});


// Carga inicial
fetchPedidos();

// Escuchar el pedido editado de ControlEditarPedido
document.addEventListener('pedidoEditado', () => {
	fetchPedidos(); // Se ejecuta en el contexto correcto y refresca todo
});

