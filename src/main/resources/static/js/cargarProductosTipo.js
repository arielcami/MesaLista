function obtenerCarritoLocal(clienteId) {
	const carrito = JSON.parse(localStorage.getItem("carrito")) || {};
	return carrito[clienteId] || {};
}

function guardarCarritoLocal(clienteId, tipo, productoId, cantidad) {
	const carrito = JSON.parse(localStorage.getItem("carrito")) || {};

	if (!carrito[clienteId]) carrito[clienteId] = {};
	if (!carrito[clienteId][tipo]) carrito[clienteId][tipo] = {};

	if (cantidad > 0) {
		carrito[clienteId][tipo][productoId] = cantidad;
	} else {
		delete carrito[clienteId][tipo][productoId];
		if (Object.keys(carrito[clienteId][tipo]).length === 0) {
			delete carrito[clienteId][tipo];
		}
	}
	localStorage.setItem("carrito", JSON.stringify(carrito));
}

function limpiarCarritoCliente(clienteId) {
	const carrito = JSON.parse(localStorage.getItem("carrito")) || {};
	delete carrito[clienteId];
	localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarProductosPorTipo(tipo, tituloCategoria = "Productos") {
	const url = `/mesalista/api/producto/tipo/activo/${tipo}`;
	const clienteId = document.getElementById("cliente-id-hidden").value;

	const carrito = JSON.parse(localStorage.getItem("carrito")) || {};
	const cantidadesPorTipo = (carrito[clienteId] && carrito[clienteId][tipo]) || {};

	fetch(url)
		.then(response => response.json())
		.then(data => {
			const modal = document.getElementById("modal-productos");
			const contenedor = document.getElementById("contenedor-productos");
			const titulo = document.getElementById("modal-titulo");

			titulo.textContent = tituloCategoria;
			contenedor.innerHTML = "";

			data.forEach(producto => {
				const item = document.createElement("div");
				item.classList.add("producto-item");
				item.id = `producto-${producto.id}`;

				let cantidad = cantidadesPorTipo[producto.id] || 0;

				item.innerHTML = `
					<h4>${producto.nombre}</h4>
					<span>S/ ${producto.precio.toFixed(2)}</span>
					<div class="cantidad-container">
						<button class="restar-cantidad">-</button>
						<span class="cantidad">${cantidad}</span>
					</div>
				`;

				const cantidadSpan = item.querySelector('.cantidad');
				const restarBtn = item.querySelector('.restar-cantidad');

				restarBtn.addEventListener('click', (e) => {
					e.stopPropagation();

					if (cantidad > 0) {
						cantidad--;
						cantidadSpan.textContent = cantidad;
						guardarCarritoLocal(clienteId, tipo, producto.id, cantidad);

						const pedidoIdGlobal = localStorage.getItem("pedido_id");
						if (pedidoIdGlobal) {
							ajustarCantidadProducto(pedidoIdGlobal, producto.id, -1);
						} else {
							//console.error("No se encontró el pedido_id en localStorage");
						}
					}
				});

				item.addEventListener('click', () => {
					cantidad++;
					cantidadSpan.textContent = cantidad;
					guardarCarritoLocal(clienteId, tipo, producto.id, cantidad);
					agregarProductoAlPedido(producto.id, 1);
				});

				contenedor.appendChild(item);
			});

			modal.classList.remove("oculto");
			modal.classList.add("activo");
		})
		.catch(error => console.error("Error al cargar productos:", error));
}


function agregarProductoAlPedido(productoId, cantidad) {
	const BASE_URL_ADD = "/mesalista/api/sp/add";
	const clienteId = document.getElementById("cliente-id-hidden").value;

	const productoElement = document.querySelector(`#producto-${productoId}`);
	if (!productoElement) {
		//console.error("Producto no encontrado en el DOM");
		return;
	}

	const precioUnitario = parseFloat(productoElement.querySelector("span").innerText.replace('S/ ', '').trim());
	const url = `${BASE_URL_ADD}?clienteId=${clienteId}&productoId=${productoId}&cantidad=${cantidad}&precioUnitario=${precioUnitario}`;

	fetch(url, { method: "POST" })
		.then(response => {
			if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
			if (response.status === 204 || response.headers.get("content-length") === "0") return {};
			return response.json();
		})
		.then(data => {
			if (data.pedido_id) {
				localStorage.setItem("pedido_id", data.pedido_id);
				//console.log("Producto agregado con éxito. Pedido ID:", data.pedido_id);
			}
		})
		.catch(error => {
			//console.error("Error al agregar producto al pedido:", error.message);
		});
}

function ajustarCantidadProducto(pedidoId, productoId, delta) {
    const BASE_URL_DELTA = "/mesalista/api/sp/delta";

    // Construir la URL con los parámetros adecuados
    const url = `${BASE_URL_DELTA}?pedidoId=${pedidoId}&productoId=${productoId}&delta=${delta}`;

    fetch(url, {
        method: "PUT"
    })
    .then(response => {
        if (!response.ok) {
            // Si la respuesta no es ok, simplemente retorna.
            return;
        }

        return response.text(); // Lee la respuesta como texto
    })
    .then(text => {
        try {
            // Intentamos parsear la respuesta como JSON
            const data = JSON.parse(text);
            // console.log("Cantidad ajustada con éxito:", data);
        } catch (error) {
            // Si no podemos parsear la respuesta, simplemente no hacemos nada
            // console.log("Respuesta no procesada como JSON:", text); 
        }
    });
}

// Cerrar modal con la X
document.getElementById("cerrar-modal").addEventListener("click", () => {
	const modal = document.getElementById("modal-productos");
	modal.classList.add("oculto");
	modal.classList.remove("activo");
});

// Cerrar modal al hacer clic fuera del contenido
document.getElementById("modal-productos").addEventListener("click", function(e) {
	if (e.target === this) {
		this.classList.add("oculto");
		this.classList.remove("activo");
	}
});

// Cerrar modal con tecla Escape
document.addEventListener("keydown", (event) => {
	const modal = document.getElementById("modal-productos");
	if (event.key === "Escape" && modal.classList.contains("activo")) {
		modal.classList.add("oculto");
		modal.classList.remove("activo");
	}
});


// Confirmar pedido y redirigir a la página de confirmar
document.getElementById("confirmar-pedido").addEventListener("click", () => {
    const pedidoId = localStorage.getItem("pedido_id");
    if (pedidoId) {
        // Redirige a la plantilla de confirmación con el pedidoId como parámetro
        window.location.href = `/mesalista/pedido/confirmar?pedidoId=${pedidoId}`;
    } else {
		alert("No hay ningún producto agregado.");
        //console.error("No se encontró el pedido_id en localStorage");
    }
});


// Cargar categorías
document.getElementById("categoria-entrada").addEventListener("click", () => {
	cargarProductosPorTipo(1, "Entradas");
});
document.getElementById("categoria-segundo").addEventListener("click", () => {
	cargarProductosPorTipo(2, "Segundos");
});
document.getElementById("categoria-bebida").addEventListener("click", () => {
	cargarProductosPorTipo(3, "Bebidas");
});
document.getElementById("categoria-postre").addEventListener("click", () => {
	cargarProductosPorTipo(4, "Postres");
});


