let urlActual = "/mesalista/api/producto";

document.addEventListener("DOMContentLoaded", function() {
	const tablaBody = document.querySelector(".tabla-productos tbody");
	const btnTodos = document.getElementById("btn-todos");
	const btnActivos = document.getElementById("btn-activos");
	const btnInactivos = document.getElementById("btn-inactivos");
	const imagenModal = document.getElementById("imagen-modal-overlay");
	const cerrarImagenModal = document.getElementById("cerrar-imagen-modal");

	// Cargar todos los productos al iniciar
	fetchAndRenderProductos(urlActual);
	
	cerrarImagenModal.addEventListener("click", () => {
		imagenModal.classList.add("hidden");
		document.getElementById("imagen-producto-preview").src = "";
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			imagenModal.classList.add("hidden");
			document.getElementById("imagen-producto-preview").src = "";
		}
	});

	document.addEventListener("click", (e) => {
		if (e.target === imagenModal) {
			imagenModal.classList.add("hidden");
			document.getElementById("imagen-producto-preview").src = "";
		}
	});

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
				mostrarPopupConfirmacion("Error", error.message);
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
				<td class="acciones-td"></td>
			`;

			const accionesTd = tr.querySelector(".acciones-td");

			// Botón Editar
			const btnEditar = document.createElement("button");
			btnEditar.classList.add("btn-editar");
			btnEditar.textContent = "Editar";
			btnEditar.setAttribute("data-id", producto.id);
			accionesTd.appendChild(btnEditar);

			// Botón Ver Imagen (si tiene imagenUrl)
			if (producto.imagenUrl) {
				const btnVerImagen = document.createElement("button");
				btnVerImagen.classList.add("btn-ver-imagen");
				btnVerImagen.textContent = "Ver imagen";
				btnVerImagen.addEventListener("click", () => {
					const modal = document.getElementById("imagen-modal-overlay");
					const img = document.getElementById("imagen-producto-preview");
					img.src = "/mesalista/" + producto.imagenUrl;
					modal.classList.remove("hidden");
				});
				accionesTd.appendChild(btnVerImagen);
			}

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
					mostrarPopupConfirmacion("Error", "Error al cambiar el estado del producto.");
				});
		});
	}

	// Edición manual con popup
	const form = document.getElementById('edit-product-form');
	const popupOverlay = document.getElementById('edit-popup-overlay');
	let submitHandler;

	// Listeners de cierre del popup (solo se agregan una vez)
	document.addEventListener("click", function(e) {
		if (e.target.id === 'edit-close-btn' || e.target === popupOverlay) {
			popupOverlay.classList.add('hidden');
		}
	});

	document.addEventListener("keydown", function(e) {
		if (e.key === 'Escape') {
			popupOverlay.classList.add('hidden');
		}
	});

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

					popupOverlay.classList.remove('hidden');

					if (submitHandler) {
						form.removeEventListener("submit", submitHandler);
					}

					submitHandler = function(e) {
						e.preventDefault();

						const nombre = document.getElementById('edit-nombre').value;
						const precio = parseFloat(document.getElementById('edit-precio').value);
						const tipo = parseInt(document.getElementById('edit-tipo').value);
						const imagenInput = document.getElementById('edit-imagen');
						const imagenFile = imagenInput.files[0];

						const formData = new FormData();

						const productoActualizado = {
							nombre: nombre,
							precio: precio,
							tipoProducto: tipo,
							estado: producto.estado
						};

						formData.append("producto", new Blob([JSON.stringify(productoActualizado)], {
							type: "application/json"
						}));

						if (imagenFile) {
							formData.append("imagen", imagenFile);
						}

						fetch(`/mesalista/api/producto/${id}`, {
							method: 'PUT',
							body: formData
						})
							.then(response => {
								if (!response.ok) throw new Error("Error al actualizar producto");
								return response.json();
							})
							.then(() => {
								popupOverlay.classList.add('hidden');
								mostrarPopupConfirmacion(
									"success",
									"Producto actualizado correctamente.",
									() => {
										fetchAndRenderProductos(urlActual);
									}
								);
							})
							.catch(err => {
								mostrarPopupConfirmacion("Error", "No se pudo actualizar el producto.");
							});
					};

					form.addEventListener("submit", submitHandler);
				})
				.catch(() => {
					mostrarPopupConfirmacion("Error", "No se pudo obtener el producto.");
				});
		});
	}
});
