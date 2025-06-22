function marcarProductoComoAgotado(productoId) {
    const url = `/mesalista/api/producto/${productoId}/estado?estado=false`;

    fetch(url, {
        method: "PATCH"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al actualizar el estado del producto");
        }
        return response.json();
    })
    .then(data => {
        mostrarPopupCustom("success", `Producto "${data.nombre}" marcado como agotado`);
        document.getElementById(`producto-${productoId}`)?.remove();
        document.getElementById(`guarnicion-${productoId}`)?.remove();
    })
    .catch(error => {
        mostrarPopupCustom("error", error.message);
    });
}

function asignarMenuContextual(itemElemento, productoId) {
    const menu = document.getElementById("modal-pedido-agotado");

    itemElemento.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // Mostrar el menú contextual en la posición del cursor
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.classList.remove("oculto");

        // Guardar ID del producto seleccionado
        menu.dataset.productoId = productoId;
    });
}

// Escuchar clic en opción "Agotado"
document.getElementById("opcion-agotar-producto").addEventListener("click", () => {
    const menu = document.getElementById("modal-pedido-agotado");
    const productoId = menu.dataset.productoId;
    if (productoId) {
        marcarProductoComoAgotado(productoId);
    }
    menu.classList.add("oculto");
});

// Escuchar clic en opción "Cancelar"
document.getElementById("opcion-cancelar-contextual").addEventListener("click", () => {
    document.getElementById("modal-pedido-agotado").classList.add("oculto");
});

// Ocultar menú si se hace clic fuera
document.addEventListener("click", (e) => {
    const menu = document.getElementById("modal-pedido-agotado");
    if (!menu.contains(e.target)) {
        menu.classList.add("oculto");
    }
});






document.addEventListener("DOMContentLoaded", function () {
	const botonAbrir = document.getElementById("btn-agregar-guarnicion");
	const modal = document.getElementById("modal-guarnicion");
	const cerrar = document.getElementById("cerrar-modal-guarnicion");

	// Abrir modal
	botonAbrir.addEventListener("click", () => {
		modal.classList.add("activo");
		cargarModalGuarnicion();
	});

	// Cerrar modal
	cerrar.addEventListener("click", () => {
		modal.classList.remove("activo");
	});

	const categoriasOrden = [
		{ tipo: 1, nombre: "Entradas" },
		{ tipo: 2, nombre: "Segundos" },
		{ tipo: 3, nombre: "Bebidas" },
		{ tipo: 4, nombre: "Postres" },
		{ tipo: 5, nombre: "Guarnicion" },
	];

	let categoriaActualIndex = 0;

	function cargarCategoriaActual() {
		const categoria = categoriasOrden[categoriaActualIndex];
		cargarProductosPorTipo(categoria.tipo, categoria.nombre);

		const btnSiguiente = document.getElementById("btn-siguiente-categoria");
		btnSiguiente.textContent = categoriaActualIndex === categoriasOrden.length - 1
			? "Confirmar pedido →"
			: "Siguiente categoría →";
	}

	document.getElementById("btn-siguiente-categoria").addEventListener("click", () => {
		if (categoriaActualIndex < categoriasOrden.length - 1) {
			categoriaActualIndex++;
			cargarCategoriaActual();
		} else {
			const pedidoId = localStorage.getItem("pedido_id");
			if (pedidoId) {
				window.location.href = `/mesalista/pedido/confirmar?pedidoId=${pedidoId}`;
			} else {
				mostrarPopupCustom("error", "No hay ningún producto agregado.");
			}
		}
	});

	document.getElementById("categoria-entrada").addEventListener("click", () => {
		categoriaActualIndex = 0;
		cargarCategoriaActual();
	});

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

					if (producto.imagenUrl) {
						item.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.3)), url('/mesalista/${producto.imagenUrl}')`;
						item.style.backgroundSize = 'cover';
						item.style.backgroundPosition = 'center';
					}

					const cantidadSpan = item.querySelector(".cantidad");
					const restarBtn = item.querySelector(".restar-cantidad");

					restarBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						if (cantidad > 0) {
							cantidad--;
							cantidadSpan.textContent = cantidad;
							guardarCarritoLocal(clienteId, tipo, producto.id, cantidad);
							const pedidoId = localStorage.getItem("pedido_id");
							if (pedidoId) {
								ajustarCantidadProducto(pedidoId, producto.id, -1);
							}
						}
					});

					item.addEventListener("click", () => {
						cantidad++;
						cantidadSpan.textContent = cantidad;
						guardarCarritoLocal(clienteId, tipo, producto.id, cantidad);
						agregarProductoAlPedido(producto.id, 1);
					});

					contenedor.appendChild(item);
					asignarMenuContextual(item, producto.id);
				});

				modal.classList.remove("oculto");
				modal.classList.add("activo");
			})
			.catch(error => {
				mostrarPopupCustom("error", "Error al cargar productos: " + error);
			});
	}

	function agregarProductoAlPedido(productoId, cantidad) {
		const clienteId = document.getElementById("cliente-id-hidden").value;
		const pedidoId = localStorage.getItem("pedido_id");

		const productoElement = document.querySelector(`#producto-${productoId}`) || document.querySelector(`#guarnicion-${productoId}`);
		if (!productoElement) return;

		const precioUnitario = parseFloat(productoElement.querySelector("span").innerText.replace('S/ ', '').trim());

		let url;
		if (pedidoId) {
			url = `/mesalista/api/sp/addConProductoId?pedidoId=${pedidoId}&productoId=${productoId}&cantidad=${cantidad}&precioUnitario=${precioUnitario}`;
		} else {
			url = `/mesalista/api/sp/add?clienteId=${clienteId}&productoId=${productoId}&cantidad=${cantidad}&precioUnitario=${precioUnitario}`;
		}

		fetch(url, { method: "POST" })
			.then(response => {
				if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
				if (response.status === 204 || response.headers.get("content-length") === "0") return {};
				return response.json();
			})
			.then(data => {
				if (data.pedido_id) {
					localStorage.setItem("pedido_id", data.pedido_id);
				}
			})
			.catch(error => {
				mostrarPopupCustom("error", "Error al agregar producto: " + error.message);
			});
	}

	function ajustarCantidadProducto(pedidoId, productoId, delta) {
		const url = `/mesalista/api/sp/delta?pedidoId=${pedidoId}&productoId=${productoId}&delta=${delta}`;
		fetch(url, { method: "PUT" });
	}

	document.getElementById("cerrar-modal").addEventListener("click", () => {
		const modal = document.getElementById("modal-productos");
		modal.classList.add("oculto");
		modal.classList.remove("activo");
	});

	document.getElementById("modal-productos").addEventListener("click", function (e) {
		if (e.target === this) {
			this.classList.add("oculto");
			this.classList.remove("activo");
		}
	});

	document.addEventListener("keydown", (event) => {
		const modal = document.getElementById("modal-productos");
		if (event.key === "Escape" && modal.classList.contains("activo")) {
			modal.classList.add("oculto");
			modal.classList.remove("activo");
		}
	});

	document.getElementById("confirmar-pedido").addEventListener("click", () => {
		const pedidoId = localStorage.getItem("pedido_id");
		if (pedidoId) {
			window.location.href = `/mesalista/pedido/confirmar?pedidoId=${pedidoId}`;
		} else {
			mostrarPopupCustom("error", "No hay ningún producto agregado.");
		}
	});

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

	function cargarModalGuarnicion() {
		const url = `/mesalista/api/producto/tipo/activo/5`;
		const clienteId = document.getElementById("cliente-id-hidden").value;
		const carrito = JSON.parse(localStorage.getItem("carrito")) || {};
		const cantidades = (carrito[clienteId] && carrito[clienteId][5]) || {};

		fetch(url)
			.then(response => response.json())
			.then(data => {
				const contenedor = document.getElementById("contenedor-guarnicion");
				contenedor.innerHTML = "";

				data.forEach(producto => {
					const item = document.createElement("div");
					item.classList.add("producto-item");
					item.id = `guarnicion-${producto.id}`;
					let cantidad = cantidades[producto.id] || 0;

					item.innerHTML = `
						<h4>${producto.nombre}</h4>
						<span>S/ ${producto.precio.toFixed(2)}</span>
						<div class="cantidad-container">
							<button class="restar-cantidad">-</button>
							<span class="cantidad">${cantidad}</span>
						</div>
					`;

					if (producto.imagenUrl) {
						item.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.3)), url('/mesalista/${producto.imagenUrl}')`;
						item.style.backgroundSize = 'cover';
						item.style.backgroundPosition = 'center';
					}

					const cantidadSpan = item.querySelector(".cantidad");
					const restarBtn = item.querySelector(".restar-cantidad");

					restarBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						if (cantidad > 0) {
							cantidad--;
							cantidadSpan.textContent = cantidad;
							guardarCarritoLocal(clienteId, 5, producto.id, cantidad);
							const pedidoId = localStorage.getItem("pedido_id");
							if (pedidoId) {
								ajustarCantidadProducto(pedidoId, producto.id, -1);
							}
						}
					});

					item.addEventListener("click", () => {
						cantidad++;
						cantidadSpan.textContent = cantidad;
						guardarCarritoLocal(clienteId, 5, producto.id, cantidad);
						agregarProductoAlPedido(producto.id, 1);
					});

					contenedor.appendChild(item);
					asignarMenuContextual(item, producto.id);
				});

				modal.classList.remove("oculto");
				modal.classList.add("activo");
			})
			.catch(error => {
				mostrarPopupCustom("error", "Error al cargar guarniciones: " + error.message);
			});
	}
});
