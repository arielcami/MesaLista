let urlActual = "/mesalista/api/producto";

document.addEventListener("DOMContentLoaded", function() {
	const tablaBody = document.querySelector(".tabla-productos tbody");
	const btnTodos = document.getElementById("btn-todos");
	const btnActivos = document.getElementById("btn-activos");
	const btnInactivos = document.getElementById("btn-inactivos");

	// Cargar todos los productos al iniciar
	fetchAndRenderProductos(urlActual);

	btnTodos.addEventListener("click", () => {
		urlActual = "/mesalista/api/producto";
		marcarBotonActivo(btnTodos);
		fetchAndRenderProductos(urlActual);
	});

	btnActivos.addEventListener("click", () => {
		urlActual = "/mesalista/api/producto/activos";
		marcarBotonActivo(btnActivos);
		fetchAndRenderProductos(urlActual);
	});

	btnInactivos.addEventListener("click", () => {
		urlActual = "/mesalista/api/producto/inactivos";
		marcarBotonActivo(btnInactivos);
		fetchAndRenderProductos(urlActual);
	});

	function marcarBotonActivo(boton) {
		[btnTodos, btnActivos, btnInactivos].forEach(btn => btn.classList.remove("active"));
		boton.classList.add("active");
	}

	function fetchAndRenderProductos(url) {
		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error("No se pudieron cargar los productos.");
				}
				return response.json();
			})
			.then(productos => {
				renderTabla(productos);
			})
			.catch(error => {
				alert(error.message);
			});
	}

	function renderTabla(productos) {
		tablaBody.innerHTML = "";

		productos.forEach(producto => {
			const tr = document.createElement("tr");

			tr.innerHTML = `
                <td><input type="text" value="${producto.id}" disabled class="input-id" /></td>
                <td class="nombre">${producto.nombre}</td>
                <td class="tipo">${getTipoProductoTexto(producto.tipoProducto)}</td>
                <td class="precio">${producto.precio.toFixed(2)}</td>
                <td class="estado-td ${producto.estado ? 'estado-activo' : 'estado-inactivo'}">
                    <span class="estado-texto" data-estado="${producto.estado}">${producto.estado ? 'Activo' : 'Inactivo'}</span>
                    ${producto.estado
					? `<img src="/mesalista/img/Down.png" alt="Deshabilitar" title="Deshabilitar"
                            class="estado-btn estado-deshabilitar" data-id="${producto.id}">`
					: `<img src="/mesalista/img/Up.png" alt="Habilitar" title="Habilitar"
                            class="estado-btn estado-habilitar" data-id="${producto.id}">`
				}
                </td>
                <td>
                    <button class="btn-editar" data-id="${producto.id}">Editar</button>
                </td>
            `;

			tablaBody.appendChild(tr);
		});

		// Reasignar eventos después de renderizar
		document.querySelectorAll(".btn-editar").forEach(btn => asignarEventoEdicion(btn));
		document.querySelectorAll(".estado-habilitar").forEach(btn => asignarCambioEstado(btn, true));
		document.querySelectorAll(".estado-deshabilitar").forEach(btn => asignarCambioEstado(btn, false));
	}

	function getTipoProductoTexto(tipo) {
		switch (tipo) {
			case 1: return "Entrada";
			case 2: return "Segundo";
			case 3: return "Bebida";
			case 4: return "Postre";
			default: return "Desconocido";
		}
	}

	function asignarCambioEstado(btn, nuevoEstado) {
		btn.addEventListener("click", () => {
			const id = btn.getAttribute("data-id");

			fetch(`/mesalista/api/producto/${id}`)
				.then(response => response.json())
				.then(producto => {
					const productoActualizado = {
						nombre: producto.nombre,
						precio: producto.precio,
						tipoProducto: producto.tipoProducto,
						estado: nuevoEstado
					};

					return fetch(`/mesalista/api/producto/${id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(productoActualizado)
					});
				})
				.then(response => {
					if (!response.ok) throw new Error("No se pudo cambiar el estado.");
					return response.json();
				})
				.then(() => {
					fetchAndRenderProductos(urlActual);
				})
				.catch(err => {
					console.error(err);
					alert("Error al cambiar el estado del producto.");
				});
		});
	}

	// Edición manual con popup
	const form = document.getElementById('edit-product-form');
	let submitHandler;

	function asignarEventoEdicion(btn) {
		btn.addEventListener("click", () => {
			const id = btn.getAttribute("data-id");

			fetch(`/mesalista/api/producto/${id}`)
				.then(response => {
					if (!response.ok) throw new Error('Producto no encontrado');
					return response.json();
				})
				.then(producto => {
					document.getElementById('edit-nombre').value = producto.nombre;
					document.getElementById('edit-precio').value = producto.precio;
					document.getElementById('edit-tipo').value = producto.tipoProducto;
					const estadoInput = document.getElementById('edit-estado');
					estadoInput.value = producto.estado ? 'Activo' : 'Inactivo';
					estadoInput.classList.remove('estado-activo', 'estado-inactivo');
					estadoInput.classList.add(producto.estado ? 'estado-activo' : 'estado-inactivo');

					const popupOverlay = document.getElementById('edit-popup-overlay');
					popupOverlay.style.display = 'flex';

					document.getElementById('edit-close-btn').addEventListener("click", () => {
						popupOverlay.style.display = 'none';
					});

					if (submitHandler) {
						form.removeEventListener("submit", submitHandler);
					}

					submitHandler = function(e) {
						e.preventDefault();

						const nombre = document.getElementById('edit-nombre').value;
						const precio = parseFloat(document.getElementById('edit-precio').value);
						const tipo = parseInt(document.getElementById('edit-tipo').value);

						const productoActualizado = {
							nombre: nombre,
							precio: precio,
							tipoProducto: tipo,
							estado: producto.estado
						};

						fetch(`/mesalista/api/producto/${id}`, {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(productoActualizado)
						})
							.then(response => {
								if (!response.ok) throw new Error("Error al actualizar producto");
								return response.json();
							})
							.then(() => {
								popupOverlay.style.display = 'none';
								fetchAndRenderProductos(urlActual);
							})
							.catch(err => {
								console.error(err);
								alert("No se pudo actualizar el producto.");
							});
					};

					form.addEventListener("submit", submitHandler);
				})
				.catch(() => {
					alert("No se pudo obtener el producto.");
				});
		});
	}
});
