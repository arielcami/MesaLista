const API_URL = '/mesalista/api/pedido/cocina'; // Ajusta la URL de tu API aquí
const REFRESH_INTERVAL_MS = 5000; // 5 segundos

function formatHora(fechaISO) {
    const fecha = new Date(fechaISO);
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // el 0 debe ser 12
    return `${horas}:${minutos} ${ampm}`;
}

function formatTelefono(telefono) {
    const limpio = telefono.replace(/\D/g, ''); // Solo conserva dígitos
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
        renderPedidos(pedidos);
    } catch (error) {
        console.error('Error de red o inesperado:', error);
    }
}

function renderPedidos(pedidos) {
    const container = document.querySelector('.pedido-container');
    container.innerHTML = ''; // limpia contenido actual

    pedidos.forEach(pedido => {
        // Ordenar detalles según tipoProducto: segundos (2), entradas (1), bebidas (3), postres (4)
        const prioridad = [2, 1, 3, 4];
        const detallesOrdenados = pedido.detalles.slice().sort((a, b) => {
            return prioridad.indexOf(a.producto.tipoProducto) - prioridad.indexOf(b.producto.tipoProducto);
        });

        const card = document.createElement('div');
        card.className = 'pedido-card';

        card.innerHTML = `
            <h2>Pedido #${pedido.id}</h2>
            <p><strong>Cliente:</strong> ${pedido.cliente.nombre} - ${pedido.cliente.documento}</p>
			<p><strong>Teléfono:</strong> ${formatTelefono(pedido.cliente.telefono)}</p>
            <p><strong>Dirección:</strong> ${pedido.direccionEntrega}</p>
            <p><strong>Hora del pedido:</strong> ${formatHora(pedido.fechaPedido)}</p>
			<p><strong>Atendido por:</strong> ${pedido.empleado.nombre}</p>
            ${detallesOrdenados.map(detalle => `
                <div class="detalle-item">
                    <p>${detalle.cantidad} × ${detalle.producto.nombre}</p>
                </div>
            `).join('')}
        `;

        container.appendChild(card);
    });
}



// Inicializa primera carga y refresca cada intervalo
fetchPedidos();
setInterval(fetchPedidos, REFRESH_INTERVAL_MS);
