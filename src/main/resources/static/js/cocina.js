const API_URL = '/mesalista/api/pedido/cocina'; // Ajusta la URL de tu API aquí
const REFRESH_INTERVAL_MS = 2000; // 2 segundos

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


let idsPedidosAnteriores = [];
let sonidoActivado = false;
const audio = new Audio('/mesalista/snd/chimes.mp3');


async function fetchPedidos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error('Error al obtener pedidos:', response.statusText);
            return;
        }

        const pedidos = await response.json();
        const idsNuevos = pedidos.map(p => p.id);

        // Comprobar si hay algún ID nuevo que antes no existía
        const hayNuevo = idsNuevos.some(id => !idsPedidosAnteriores.includes(id));

        if (hayNuevo && sonidoActivado) {
            audio.play().catch(err => console.warn("No se pudo reproducir el sonido:", err));
        }

        // Guardar los IDs para la próxima comparación
        idsPedidosAnteriores = idsNuevos;

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
		const detallesOrdenados = pedido.detalles
		    .filter(detalle => detalle.cantidad > 0)
		    .sort((a, b) => {
		        return prioridad.indexOf(a.producto.tipoProducto) - prioridad.indexOf(b.producto.tipoProducto);
		    });

        const card = document.createElement('div');
        card.className = 'pedido-card';

        card.innerHTML = `
            <h2>Pedido #${pedido.id}</h2>
			<p><strong>Cliente:</strong> ${pedido.cliente?.nombre ?? 'Sin nombre'} - ${pedido.cliente?.documento ?? 'Sin documento'}</p>
			<p><strong>Teléfono:</strong> ${formatTelefono(pedido.cliente.telefono)}</p>
			<p><strong>Dirección:</strong> ${pedido.direccionEntrega ? pedido.direccionEntrega : 'No especificada'}</p>
            <p><strong>Hora del pedido:</strong> ${formatHora(pedido.fechaPedido)}</p>
			<p><strong>Atendido por:</strong> ${pedido.empleado?.nombre ?? 'Sin asignar'}</p>
            ${detallesOrdenados.map(detalle => `
                <div class="detalle-item">
                    <p>${detalle.cantidad} × ${detalle.producto.nombre}</p>
                </div>
            `).join('')}
        `;

        container.appendChild(card);
    });
}

function actualizarReloj() {
    const reloj = document.getElementById('reloj');
    const ahora = new Date();

    let horas = ahora.getHours();
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12 || 12;

    reloj.textContent = `${horas}:${minutos}:${segundos} ${ampm}`;
}

// Actualizar cada segundo
setInterval(actualizarReloj, 1000);
actualizarReloj(); // llamada inicial

// Inicializa primera carga y refresca cada intervalo
fetchPedidos();
setInterval(fetchPedidos, REFRESH_INTERVAL_MS)



document.getElementById('btn-sonido').addEventListener('click', () => {
    audio.play().then(() => {
        sonidoActivado = true;
        console.log("Sonido activado");
        //alert("Sonido activado. Se notificará con un sonido cuando llegue un pedido nuevo.");
    }).catch(err => {
        console.warn("El navegador bloqueó el sonido hasta que el usuario interactúe:", err);
        //alert("Haz clic nuevamente si no escuchaste el sonido.");
    });
});


