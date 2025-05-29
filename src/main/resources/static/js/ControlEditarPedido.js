//====== ControlEditarPedido.js =======//

const modalEditar = document.getElementById('modal-editar-pedido');
const contenedorProductos = document.getElementById('lista-productos-editables');
const inputBuscar = document.getElementById('input-busqueda-producto');
const contenedorSugerencias = document.getElementById('resultados-busqueda');
const btnGuardarCambios = document.getElementById('btn-guardar-edicion');

let pedidoActual = null;

// Abrir modal
async function abrirModalEditar(pedidoId) {
	try {
		const response = await fetch(`/mesalista/api/pedido/${pedidoId}`);
		if (!response.ok) throw new Error("No se pudo obtener el pedido completo");

		const pedido = await response.json();

		pedidoActual = pedido;

		// Guardar en localStorage sólo el id
		localStorage.setItem('pedidoId', pedidoId);

		document.getElementById('modal-editar-titulo').textContent = `Editar pedido: #${pedidoId}`;

		// Renderizar productos (pasamos el array detalles)
		renderProductosPedido(pedidoActual.detalles);

		// Setear el select de estado con el estado actual del pedido
		document.getElementById('select-estado-pedido').value = pedidoActual.estadoPedido;

		modalEditar.classList.remove('hidden');

	} catch (error) {
		console.error('Error al cargar pedido completo para editar:', error);
	}
}



// Renderiza productos actuales del pedido
function renderProductosPedido(detalles) {
	contenedorProductos.innerHTML = '';

	const prioridad = [2, 1, 3, 4];
	const detallesOrdenados = detalles
		.filter(detalle => detalle.cantidad > 0)
		.sort((a, b) => {
			return prioridad.indexOf(a.producto.tipoProducto) - prioridad.indexOf(b.producto.tipoProducto);
		});

	detallesOrdenados.forEach(detalle => {
		const div = document.createElement('div');
		div.classList.add('producto-item');
		div.dataset.productoId = detalle.producto.id;

		div.innerHTML = `
            <div class="cantidad-control">
                <button class="btn-cantidad" onclick="cambiarCantidad(${detalle.producto.id}, -1)">-</button>
                <span id="cantidad-${detalle.producto.id}">${detalle.cantidad}</span>
                <span class="multiplicador">×</span>
                <span class="nombre-producto">${detalle.producto.nombre}</span>
                <button class="btn-cantidad" onclick="cambiarCantidad(${detalle.producto.id}, 1)">+</button>
            </div>
        `;

		contenedorProductos.appendChild(div);
	});

	inputBuscar.value = '';
	contenedorSugerencias.innerHTML = '';
}

// Esto ejecuta un SP en la base de datos
async function ajustarCantidadProducto(pedidoId, productoId, delta) {
	const url = `/mesalista/api/sp/delta?pedidoId=${pedidoId}&productoId=${productoId}&delta=${delta}`;

	try {
		const response = await fetch(url, {
			method: "PUT"
		});
		if (!response.ok) {
			throw new Error("Error al ajustar la cantidad del producto.");
		}
		return await response.text();
	} catch (error) {
		console.error("Fallo al ajustar la cantidad del producto:", error);
	}
}



// Cambia cantidad de un producto
function cambiarCantidad(productoId, delta) {
	if (!pedidoActual || !pedidoActual.id) return;

	ajustarCantidadProducto(pedidoActual.id, productoId, delta).then(() => {
		const detalle = pedidoActual.detalles.find(d => d.producto.id === productoId);
		if (!detalle) return;

		// Actualiza cantidad en el array local
		detalle.cantidad = Math.max(detalle.cantidad + delta, 0);

		renderProductosPedido(pedidoActual.detalles);
	});
}


async function actualizarPedidoCompleto(pedido) {
	try {
		const response = await fetch(`/mesalista/api/pedido/${pedido.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(pedido)
		});

		if (!response.ok) throw new Error('Error actualizando pedido');

		return await response.json();

	} catch (error) {
		console.error(error);
		alert('No se pudo actualizar el pedido.');
		throw error;
	}
}

// Agrega un producto nuevo al pedido usando el SP en el backend
async function agregarProducto(producto) {

	const pedidoId = localStorage.getItem('pedidoId');

	if (!pedidoId) {
		alert("No se puede agregar producto: información de pedido no disponible.");
		return;
	}

	// Evitar duplicados
	if (pedidoActual.detalles.find(d => d.producto.id === producto.id)) {
		alert("Producto ya está en el pedido");
		return;
	}

	try {
		const productoId = producto.id;
		const cantidad = 1;
		const precioUnitario = producto.precioUnitario ?? 0;

		const url = `/mesalista/api/sp/addConProductoId?pedidoId=${pedidoId}&productoId=${productoId}&cantidad=${cantidad}&precioUnitario=${precioUnitario}`;

		const response = await fetch(url, {
			method: "POST"
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error al agregar producto: ${errorText}`);
		}

		const data = await response.json();

		// Actualizar el pedidoActual con el nuevo ID si vino desde el backend (aunque no debería cambiar en esta versión)
		if (data.pedido_id) {
			pedidoActual.id = data.pedido_id;
		}

		// Agregar a memoria local
		pedidoActual.detalles.push({
			producto: producto,
			cantidad: cantidad,
			precioUnitario: precioUnitario
		});

		renderProductosPedido(pedidoActual.detalles);
		inputBuscar.value = '';
		contenedorSugerencias.innerHTML = '';

	} catch (error) {
		console.error("Error al agregar producto:", error);
		alert("No se pudo agregar el producto. Intenta nuevamente.");
	}
}

// Buscar productos mientras se escribe
inputBuscar.addEventListener('input', async (e) => {
	const query = e.target.value.trim();
	contenedorSugerencias.innerHTML = '';

	if (query.length < 2) return;

	try {
		const response = await fetch(`/mesalista/api/producto/buscar-nombre-activo/${query}`);
		if (!response.ok) throw new Error("Error al buscar productos");
		const productos = await response.json();

		productos.forEach(producto => {
			const div = document.createElement('div');
			div.classList.add('sugerencia-item');
			div.textContent = producto.nombre;
			div.addEventListener('click', () => agregarProducto(producto));
			contenedorSugerencias.appendChild(div);
		});
	} catch (error) {
		console.error("Error al buscar productos:", error);
	}
});


btnGuardarCambios.addEventListener('click', async () => {
	// 1. Obtener el pedido ID desde localStorage
	const pedido_ID = localStorage.getItem('pedidoId');

	// Validación básica
	if (!pedido_ID) {
		alert("No se encontró el ID del pedido en localStorage.");
		return;
	}

	// 2. Capturar el nuevo estado del pedido
	const estadoDelPedido = document.getElementById('select-estado-pedido').value;

	try {
		// 3. Hacer la petición PUT
		const response = await fetch(`/mesalista/api/pedido/marcarEstado/${pedido_ID}?estado=${estadoDelPedido}`, {
			method: 'PUT'
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error al actualizar estado del pedido: ${errorText}`);
		}

		// 4. Si fue exitoso, limpiar localStorage y continuar
		localStorage.clear();
		modalEditar.classList.add('hidden');
		document.dispatchEvent(new Event('pedidoEditado'));

	} catch (error) {
		console.error("Error al guardar cambios del pedido:", error);
		alert("Ocurrió un error al guardar el estado del pedido. Revisa la consola.");
	}
});



window.addEventListener('keydown', (keyboard) => {
	if (keyboard.key === 'Escape') {
		localStorage.clear();
		modalEditar.classList.add('hidden');
	}
});

// Cerrar modal con el botón de cerrar (la X)
document.getElementById('btn-cerrar-editar').addEventListener('click', () => {
	localStorage.clear();
	modalEditar.classList.add('hidden');
});
