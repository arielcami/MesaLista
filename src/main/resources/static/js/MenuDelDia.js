document.addEventListener("DOMContentLoaded", function() {
	const tabs = document.querySelectorAll(".menu-del-dia__tab-item");
	const contenedor = document.getElementById("menu-del-dia__productos-listado");

	const tipos = {
		1: 'Entradas',
		2: 'Fondos',
		3: 'Bebidas',
		4: 'Postres'
	};

	function mostrarError(mensaje) {
		mostrarPopupConfirmacion("error", mensaje, null, null);
	}

	function mostrarSuccess(mensaje) {
		mostrarPopupConfirmacion("success", mensaje, null, null);
	}

	tabs.forEach(tab => {
		tab.addEventListener("click", () => {
			tabs.forEach(t => t.classList.remove("menu-del-dia__tab-item--activo"));
			tab.classList.add("menu-del-dia__tab-item--activo");

			const diaSeleccionado = tab.dataset.dia;

			fetch(`/mesalista/api/menu-del-dia/dia/${diaSeleccionado}`)
				.then(res => {
					if (res.status === 204) return [];
					if (!res.ok) throw new Error("Error en la respuesta del servidor");
					return res.json();
				})
				.then(data => {
					if (!Array.isArray(data)) throw new Error("La respuesta no es un array");

					const categorias = { 1: [], 2: [], 3: [], 4: [] };

					data.forEach(item => {
						const producto = item.producto;
						if (categorias[producto.tipoProducto]) {
							categorias[producto.tipoProducto].push({
								id: producto.id,
								nombre: producto.nombre
							});
						}
					});

					const html = Object.entries(categorias).map(([tipo, productos]) => {
						const nombreCategoria = tipos[tipo];
						const items = productos.length > 0
							? productos.map(p => `<li data-id="${p.id}">${p.nombre}</li>`).join("")
							: `<li class="menu-del-dia__producto-vacio">No hay productos aún</li>`;

						return `
							  <div class="menu-del-dia__categoria" data-tipo="${tipo}">
							    <h3>${nombreCategoria}</h3>
							    <ul class="menu-del-dia__lista-productos">${items}</ul>
							    <button class="menu-del-dia__btn-agregar" title="Agregar producto">+</button>
							    <input type="text" class="menu-del-dia__input-busqueda" placeholder="Agregar producto..." style="display:none;">
							  </div>
							`;

					}).join("");

					contenedor.innerHTML = `<div class="menu-del-dia__productos-grid">${html}</div>`;

					document.querySelectorAll(".menu-del-dia__categoria").forEach(categoria => {
						const input = categoria.querySelector(".menu-del-dia__input-busqueda");
						
						const btnAgregar = categoria.querySelector(".menu-del-dia__btn-agregar");
						btnAgregar.addEventListener("click", (e) => {
						  e.stopPropagation(); // para que no burbujee si tienes otros listeners
						  
						  // Ocultar otros inputs abiertos
						  document.querySelectorAll(".menu-del-dia__input-busqueda").forEach(inp => {
						    if (inp !== input) inp.style.display = "none";
						  });

						  if (input.style.display === "block") {
						    input.style.display = "none";
						  } else {
						    input.style.display = "block";
						    input.focus();
						  }
						});
						
						
					});

					document.querySelectorAll('.menu-del-dia__categoria').forEach(categoriaDiv => {
						const input = categoriaDiv.querySelector('.menu-del-dia__input-busqueda');
						const ulProductos = categoriaDiv.querySelector('.menu-del-dia__lista-productos');
						const sugerenciasGlobal = document.getElementById('menu-del-dia__sugerencias-global');

						let debounceTimer;

						input.addEventListener('input', () => {
							clearTimeout(debounceTimer);
							debounceTimer = setTimeout(() => {
								const texto = input.value.trim();
								if (texto.length < 2) {
									sugerenciasGlobal.style.display = 'none';
									sugerenciasGlobal.innerHTML = '';
									return;
								}

								fetch(`/mesalista/api/producto/buscar/${texto}`)
									.then(res => res.json())
									.then(productos => {
										const tipoCategoria = parseInt(categoriaDiv.dataset.tipo);
										const productosFiltrados = productos.filter(p => p.tipoProducto === tipoCategoria);

										sugerenciasGlobal.innerHTML = '';
										productosFiltrados.forEach(prod => {
											const li = document.createElement('li');
											li.textContent = prod.nombre;
											li.classList.add('menu-del-dia__sugerencia-item');
											li.addEventListener('click', () => {
												const diaActivo = document.querySelector('.menu-del-dia__tab-item--activo').dataset.dia;

												fetch('/mesalista/api/menu-del-dia', {
													method: 'POST',
													headers: {
														'Content-Type': 'application/json'
													},
													body: JSON.stringify({
														producto: { id: prod.id },
														dia: { id: parseInt(diaActivo) }
													})
												})
													.then(res => {
														if (res.status === 201) {
															const vacio = ulProductos.querySelector('.menu-del-dia__producto-vacio');
															if (vacio) vacio.remove();

															const nuevoLi = document.createElement('li');
															nuevoLi.textContent = prod.nombre;
															nuevoLi.dataset.id = prod.id;
															ulProductos.appendChild(nuevoLi);
															input.value = '';
															sugerenciasGlobal.style.display = 'none';
															sugerenciasGlobal.innerHTML = '';
															input.style.display = 'none';
														} else if (res.status === 409) {
															mostrarError('Este producto ya fue agregado.');
															sugerenciasGlobal.style.display = 'none';
															sugerenciasGlobal.innerHTML = '';
														} else {
															mostrarError('Error al agregar producto.');
														}
													});
											});
											sugerenciasGlobal.appendChild(li);
										});
										sugerenciasGlobal.style.display = productosFiltrados.length > 0 ? 'block' : 'none';

										if (productosFiltrados.length > 0) {
											const rect = input.getBoundingClientRect();
											sugerenciasGlobal.style.position = 'absolute';
											sugerenciasGlobal.style.top = (rect.bottom + window.scrollY) + 'px';
											sugerenciasGlobal.style.left = (rect.left + window.scrollX) + 'px';
											sugerenciasGlobal.style.width = rect.width + 'px';
										}
									})
									.catch(err => {
										// console.error("Error en fetch de sugerencias:", err);
										mostrarError("Error al buscar productos.");
										sugerenciasGlobal.style.display = 'none';
										sugerenciasGlobal.innerHTML = '';
									});
							}, 250);
						});

						ulProductos.addEventListener('click', (e) => {
							if (e.target.tagName.toLowerCase() === 'li' && !e.target.classList.contains('menu-del-dia__producto-vacio')) {
								const li = e.target;
								const productoId = li.dataset.id;
								const diaActivo = document.querySelector('.menu-del-dia__tab-item--activo').dataset.dia;

								mostrarPopupConfirmacion("question", `¿Deseas eliminar "${li.textContent}" del menú del día?`, () => {
									fetch(`/mesalista/api/menu-del-dia/${productoId}/${diaActivo}`, {
										method: 'DELETE'
									})
										.then(res => {
											if (res.status === 204) {
												li.remove();
												if (ulProductos.children.length === 0) {
													ulProductos.innerHTML = `<li class="menu-del-dia__producto-vacio">No hay productos aún</li>`;
												}
											} else {
												mostrarError("No se pudo eliminar el producto.");
											}
										})
										.catch(err => {
											console.error("Error al eliminar:", err);
											mostrarError("Error en la conexión.");
										});
								});
							}
						});
					});
				})
				.catch(err => {
					console.error("Error al cargar productos:", err);
					contenedor.innerHTML = `<p class="menu-del-dia__error">Error al cargar el menú del día.</p>`;
				});
		});
	});

	document.getElementById("menu-del-dia__btn-activar").addEventListener("click", () => {
		mostrarPopupConfirmacion("question", "¿Estás seguro de que deseas activar este menú del día?", () => {
			const productoIds = Array.from(document.querySelectorAll(".menu-del-dia__lista-productos li"))
				.filter(li => !li.classList.contains("menu-del-dia__producto-vacio"))
				.map(li => li.dataset.id);

			fetch('/mesalista/api/producto/reset-estado', { method: 'PUT' })
				.then(res => {
					if (!res.ok) throw new Error("Error al resetear productos");
					return Promise.all(
						productoIds.map(id =>
							fetch(`/mesalista/api/producto/${id}/activar`, { method: 'PUT' })
						)
					);
				})
				.then(() => {
					mostrarSuccess("Menú del día activado correctamente.");
				})
				.catch(err => {
					console.error("Error al activar el menú del día:", err);
					mostrarError("Hubo un problema al activar el menú del día.");
				});
		});
	});

	document.addEventListener('click', (event) => {
		if (event.target.closest('.menu-del-dia__categoria')) return;
		document.querySelectorAll('.menu-del-dia__input-busqueda').forEach(input => {
			if (input.style.display === 'block') {
				input.style.display = 'none';
			}
		});
	});
});
