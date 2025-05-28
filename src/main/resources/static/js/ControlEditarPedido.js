const modalEditar = document.getElementById('modal-editar-pedido');
const contenedorProductos = document.getElementById('lista-productos-editables');
const inputBuscar = document.getElementById('input-busqueda-producto');
const contenedorSugerencias = document.getElementById('resultados-busqueda');
const btnGuardarCambios = document.getElementById('btn-guardar-edicion');

let pedidoActual = null;

// Abrir modal
async function abrirModalEditar(pedidoId) {
	try {
		// Obtener detalles del pedido (productos y cantidades)
		const response = await fetch(`/mesalista/api/detallepedido/pedido/${pedidoId}`);
		if (!response.ok) throw new Error("No se pudo obtener los detalles del pedido");

		const detalles = await response.json();

		// Guardamos la estructura básica del pedido actual
		pedidoActual = {
			id: pedidoId,
			detalles: detalles.map(d => ({
				producto: d.producto,
				cantidad: d.cantidad
			}))
		};

		// Guardar en localStorage	
		localStorage.setItem('pedidoId', pedidoId);
		// localStorage.setItem('clienteId', pedidoActual.clienteId);

		document.getElementById('modal-editar-titulo').textContent = `Editar pedido: #${pedidoId}`;

		renderProductosPedido(pedidoActual.detalles);
		modalEditar.classList.remove('hidden');

	} catch (error) {
		console.error('Error al cargar detalles del pedido para editar:', error);
	}
}


// Renderiza productos actuales del pedido
function renderProductosPedido(detalles) {
	contenedorProductos.innerHTML = '';
	detalles.forEach(detalle => {
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

// Agrega un producto nuevo al pedido usando el SP en el backend
async function agregarProducto(producto) {

	const pedidoId = localStorage.getItem('pedidoId');
	const clienteId = localStorage.getItem('clienteId');

	if (!pedidoId || !clienteId) {
		alert("No se puede agregar producto: información de pedido o cliente no disponible.");
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
		const precioUnitario = producto.precio;

		const url = `/mesalista/api/sp/add?clienteId=${clienteId}&productoId=${productoId}&cantidad=${cantidad}&precioUnitario=${precioUnitario}`;

		const response = await fetch(url, {
			method: "POST"
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error al agregar producto: ${errorText}`);
		}

		const data = await response.json();

		// Actualizar el pedidoActual con el nuevo ID si vino desde el backend (puede cambiar si se creó uno nuevo)
		if (data.pedido_id) {
			pedidoActual.id = data.pedido_id;
		}

		// Agregar a memoria local
		pedidoActual.detalles.push({
			producto: producto,
			cantidad: cantidad
		});

		renderProductosPedido(pedidoActual.detalles);
		inputBuscar.value = '';
		contenedorSugerencias.innerHTML = '';

	} catch (error) {
		console.error("Error al agregar producto:", error);
		alert("No se pudo agregar el producto. Intenta nuevamente.");
	}
}

btnGuardarCambios.addEventListener('click', async () => {
	localStorage.clear();
	modalEditar.classList.add('hidden');
	// Exportar el evento al global
	document.dispatchEvent(new Event('pedidoEditado'));
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
