document.addEventListener("DOMContentLoaded", function() {
	const tabs = document.querySelectorAll(".menu-del-dia__tab-item");
	const contenedor = document.getElementById("menu-del-dia__productos-listado");

	const tipos = {
		1: 'Entradas',
		2: 'Fondos',
		3: 'Bebidas',
		4: 'Postres'
	};

	tabs.forEach(tab => {
		tab.addEventListener("click", () => {
			tabs.forEach(t => t.classList.remove("menu-del-dia__tab-item--activo"));
			tab.classList.add("menu-del-dia__tab-item--activo");

			const diaSeleccionado = tab.dataset.dia;

			fetch(`/mesalista/api/menu-del-dia/dia/${diaSeleccionado}`)
				.then(res => {
					if (!res.ok) {
						throw new Error("Error en la respuesta del servidor");
					}
					return res.json();
				})
				.then(data => {
					// Asegurarse que sea un array
					if (!Array.isArray(data)) throw new Error("La respuesta no es un array");

					// Procesar normalmente
					const categorias = {
						1: [],
						2: [],
						3: [],
						4: []
					};

					data.forEach(item => {
						const producto = item.producto;
						if (categorias[producto.tipoProducto]) {
							categorias[producto.tipoProducto].push(producto.nombre);
						}
					});

					const html = Object.entries(categorias).map(([tipo, productos]) => {
						const nombreCategoria = tipos[tipo];
						const items = productos.map(p => `<li>${p}</li>`).join("");
						return `
			                <div class="menu-del-dia__categoria">
			                    <h3>${nombreCategoria}</h3>
			                    <ul>${items}</ul>
			                </div>
			            `;
					}).join("");

					contenedor.innerHTML = `<div class="menu-del-dia__productos-grid">${html}</div>`;
				})
				.catch(err => {
					console.error("Error al cargar productos:", err);
					contenedor.innerHTML = `<p class="menu-del-dia__error">Error al cargar el menú del día.</p>`;
				});
		});
	});
});
