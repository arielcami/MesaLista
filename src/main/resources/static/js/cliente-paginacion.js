document.addEventListener("DOMContentLoaded", () => {
	const inputBuscarNombre = document.getElementById("input-buscar-nombre");
	const paginacionControls = document.getElementById("paginacion-controls");

	let paginaActual = 0;
	const tamanioPagina = 10;
	let totalPaginas = 0;

	// Función para construir la URL paginada y llamar a cargarClientes global
	const cargarClientesPaginados = (nombre = "", pagina = 0) => {
		let url = "";
		if (nombre.trim() === "") {
			url = `/mesalista/api/cliente/paginado?page=${pagina}&size=${tamanioPagina}`;
		} else {
			url = `/mesalista/api/cliente/paginado/nombre?nombre=${encodeURIComponent(nombre.trim())}&page=${pagina}&size=${tamanioPagina}`;
		}

		fetch(url)
			.then(response => {
				if (!response.ok) throw new Error("Error al cargar clientes");
				return response.json();
			})
			.then(data => {
				// Llama al global cargarClientes para renderizar (requiere ajustar cliente.js para que acepte data.content)
				renderizarControlesPaginacion(data.totalPages, data.number);

				// Renderizar tabla usando datos recibidos, llamando la función global en cliente.js
				renderizarClientes(data.content);
			})
			.catch(error => {
				console.error("Error:", error);
				alert("No se pudieron cargar los clientes paginados.");
			});
	};

	const renderizarClientes = (clientes) => {
		// Limpiamos tabla y agregamos filas, llamamos agregarEventosEdicion
		const clientesTableBody = document.querySelector('.tabla-clientes tbody');
		clientesTableBody.innerHTML = "";

		clientes.forEach(cliente => {
			const row = document.createElement("tr");
			row.innerHTML = `
					<td><input type="text" value="${cliente.id}" disabled class="input-id" name="cliente-id-unico"/></td>
					<td class="nombre">${cliente.nombre}</td>
					<td class="telefono">${cliente.telefono}</td>
					<td class="documento">${cliente.documento}</td>
					<td class="direccion">${cliente.direccion}</td>
					<td><button class="btn-editar" data-id="${cliente.id}">Editar</button></td>`;
			clientesTableBody.appendChild(row);
		});

		if (typeof window.agregarEventosEdicion === "function") {
			window.agregarEventosEdicion();
		}
	};

	const renderizarControlesPaginacion = (total, paginaSeleccionada) => {
		totalPaginas = total;
		paginacionControls.innerHTML = "";

		for (let i = 0; i < totalPaginas; i++) {
			const btn = document.createElement("button");
			btn.textContent = i + 1;
			btn.classList.add("btn-pagina");
			if (i === paginaSeleccionada) btn.classList.add("activa");

			btn.addEventListener("click", () => {
				paginaActual = i;
				cargarClientesPaginados(inputBuscarNombre.value, paginaActual);
			});

			paginacionControls.appendChild(btn);
		}
	};

	inputBuscarNombre.addEventListener("input", () => {
		paginaActual = 0;
		cargarClientesPaginados(inputBuscarNombre.value, paginaActual);
	});

	// Carga inicial de la página
	cargarClientesPaginados();
});
