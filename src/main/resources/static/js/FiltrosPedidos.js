// === FiltrosPedidos.js ===

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

let estadoFiltro = '';
let clienteFiltro = '';
let empleadoFiltro = '';
let fechaFiltro = '';

export function inicializarFiltroPedidos(pedidos, renderPedidosFn) {
    listaPedidosCompleta = pedidos;
    renderPedidosCallback = renderPedidosFn;
    renderTodosLosFiltros();
    aplicarFiltrosCombinados();
}

function renderTodosLosFiltros() {
    renderFiltroEstado();
    renderFiltroCliente();
    renderFiltroEmpleado();
    renderFiltroFecha();
}

// Filtro por estado
function renderFiltroEstado() {
    const contenedor = document.getElementById('filtro-estado-container');
    if (!contenedor || document.getElementById('filtro-estado')) return;

    const label = document.createElement('label');
    label.setAttribute('for', 'filtro-estado');
    label.textContent = 'Estado:';

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

    // Seleccionar "En preparación" por defecto y aplicar filtro
    select.value = '1';
    estadoFiltro = '1';
    aplicarFiltrosCombinados();

    select.addEventListener('change', () => {
        estadoFiltro = select.value;
        aplicarFiltrosCombinados();
    });
}

// === Filtro por nombre de cliente ===
function renderFiltroCliente() {
    const contenedor = document.getElementById('filtro-cliente-container');
    if (!contenedor || document.getElementById('input-filtro-cliente')) return;

    const label = document.createElement('label');
    label.setAttribute('for', 'input-filtro-cliente');
    label.textContent = 'Cliente:';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'input-filtro-cliente';
    input.placeholder = 'Buscar por nombre...';

    contenedor.appendChild(label);
    contenedor.appendChild(input);

    input.addEventListener('input', () => {
        clienteFiltro = input.value.trim().toLowerCase();
        aplicarFiltrosCombinados();
    });
}

// === Filtro por nombre de empleado ===
function renderFiltroEmpleado() {
    const contenedor = document.getElementById('filtro-empleado-container');
    if (!contenedor || document.getElementById('input-filtro-empleado')) return;

    const label = document.createElement('label');
    label.setAttribute('for', 'input-filtro-empleado');
    label.textContent = 'Empleado:';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'input-filtro-empleado';
    input.placeholder = 'Buscar por empleado...';

    contenedor.appendChild(label);
    contenedor.appendChild(input);

    input.addEventListener('input', () => {
        empleadoFiltro = input.value.trim().toLowerCase();
        aplicarFiltrosCombinados();
    });
}

// === Filtro por fecha relativa (Hoy, Ayer, Antes de ayer) ===
function renderFiltroFecha() {
    const contenedor = document.getElementById('filtro-fecha-container');
    if (!contenedor || document.getElementById('filtro-fecha')) return;

    const label = document.createElement('label');
    label.setAttribute('for', 'filtro-fecha');
    label.textContent = 'Fecha:';

    const select = document.createElement('select');
    select.id = 'filtro-fecha';

    const opciones = [
        { value: '', text: '-- Todas --' },
        { value: 'hoy', text: 'Hoy' },
        { value: 'ayer', text: 'Ayer' },
        { value: 'antesdeayer', text: 'Antes de ayer' }
    ];

    opciones.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        select.appendChild(option);
    });

    contenedor.appendChild(label);
    contenedor.appendChild(select);

    // Seleccionar "Hoy" por defecto y aplicar filtro
    select.value = 'hoy';
    fechaFiltro = 'hoy';
    aplicarFiltrosCombinados();

    select.addEventListener('change', () => {
        fechaFiltro = select.value;
        aplicarFiltrosCombinados();
    });
}


function aplicarFiltrosCombinados() {
    let filtrados = [...listaPedidosCompleta];

    // Filtrar por estado
    if (estadoFiltro !== '') {
        const estadoInt = parseInt(estadoFiltro, 10);
        filtrados = filtrados.filter(p => p.estadoPedido === estadoInt);
    }

    // Filtrar por cliente
    if (clienteFiltro !== '') {
        filtrados = filtrados.filter(p =>
            p.cliente &&
            p.cliente.nombre &&
            p.cliente.nombre.toLowerCase().includes(clienteFiltro)
        );
    }

    // Filtrar por empleado
    if (empleadoFiltro !== '') {
        filtrados = filtrados.filter(p =>
            p.empleado &&
            p.empleado.nombre &&
            p.empleado.nombre.toLowerCase().includes(empleadoFiltro)
        );
    }

    // Filtrar por fecha relativa
    if (fechaFiltro !== '') {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaPedidoToDate = (pedido) => {
            const fecha = new Date(pedido.fechaPedido);
            fecha.setHours(0, 0, 0, 0);
            return fecha;
        };

        const compararDias = (diasRestar) => {
            const comparacion = new Date(hoy);
            comparacion.setDate(hoy.getDate() - diasRestar);
            return comparacion.getTime();
        };

        filtrados = filtrados.filter(pedido => {
            const pedidoFecha = fechaPedidoToDate(pedido);
            const pedidoTime = pedidoFecha.getTime();

            if (fechaFiltro === 'hoy') {
                return pedidoTime === compararDias(0);
            } else if (fechaFiltro === 'ayer') {
                return pedidoTime === compararDias(1);
            } else if (fechaFiltro === 'antesdeayer') {
                return pedidoTime === compararDias(2);
            }
            return true;
        });
    }

    if (typeof renderPedidosCallback === 'function') {
        renderPedidosCallback(filtrados);
    }
}

