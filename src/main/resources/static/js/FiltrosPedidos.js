// === FiltrosPedidos.js ===

// Diccionario de estados
const estadosPedido = {
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

let listaPedidosCompleta = [];
let renderPedidosCallback = null;

// Renderiza el select dinámicamente dentro del contenedor
function renderFiltroEstado(containerId = 'filtro-estado-container') {
    const contenedor = document.getElementById(containerId);
    if (!contenedor) return;

    // Evita duplicar si ya fue insertado
    if (document.getElementById('filtro-estado')) return;

    const label = document.createElement('label');
    label.setAttribute('for', 'filtro-estado');
    label.textContent = 'Mostrar por estado:';

    const select = document.createElement('select');
    select.id = 'filtro-estado';

    const optionTodos = document.createElement('option');
    optionTodos.value = '';
    optionTodos.textContent = '-- Todos --';
    select.appendChild(optionTodos);

    for (const [codigo, nombre] of Object.entries(estadosPedido)) {
        const option = document.createElement('option');
        option.value = codigo;
        option.textContent = nombre;
        select.appendChild(option);
    }

    contenedor.appendChild(label);
    contenedor.appendChild(select);

    select.addEventListener('change', () => {
        const estadoSeleccionado = select.value;
        aplicarFiltroEstado(estadoSeleccionado);
    });
}

function aplicarFiltroEstado(codigoEstado) {
    let pedidosFiltrados = listaPedidosCompleta;

    if (codigoEstado !== '') {
        const estadoInt = parseInt(codigoEstado, 10);
        pedidosFiltrados = listaPedidosCompleta.filter(p => p.estadoPedido === estadoInt);
    }

    if (typeof renderPedidosCallback === 'function') {
        renderPedidosCallback(pedidosFiltrados);
    }
}

// ✅ Esta es la única función que se exporta
export function inicializarFiltroPedidos(pedidos, renderPedidosFn) {
    listaPedidosCompleta = pedidos;
    renderPedidosCallback = renderPedidosFn;
    renderFiltroEstado();
}
