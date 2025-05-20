document.addEventListener("DOMContentLoaded", () => {
	const tablaBody = document.querySelector("#tabla-deliveries-body");
	const btnTodos = document.getElementById("btn-todos-deliveries");
	const btnActivos = document.getElementById("btn-activos-deliveries");
	const btnInactivos = document.getElementById("btn-inactivos-deliveries");

	if (!tablaBody || !btnTodos || !btnActivos || !btnInactivos) return;

	let deliveriesCache = [];

	function fetchYRenderDeliveries(endpoint = "/mesalista/api/empleado/nivel/3") {
		fetch(endpoint)
			.then((res) => {
				if (!res.ok) throw new Error("Error al obtener deliveries");
				return res.json();
			})
			.then((data) => {
				deliveriesCache = data;
				renderTabla(data);
			})
			.catch((err) => {
				console.error("Error:", err);
				alert("No se pudo cargar la lista de deliveries.");
			});
	}

	function renderTabla(data) {
		tablaBody.innerHTML = "";

		if (!data.length) {
			tablaBody.innerHTML = "<tr><td colspan='6'>No hay datos para mostrar.</td></tr>";
			return;
		}

		data.forEach((delivery) => {
			const fila = document.createElement("tr");
			fila.innerHTML = `
				<td><input type="text" value="${delivery.id}" disabled class="input-id" /></td>
				<td>${delivery.nombre}</td>
				<td>${delivery.unidad}</td>
				<td>${delivery.placa}</td>
				<td class="estado-td ${delivery.estado ? "estado-activo" : "estado-inactivo"}">
					<span class="estado-texto" data-estado="${delivery.estado}">
						${delivery.estado ? "Activo" : "Inactivo"}
					</span>
					${delivery.estado
					? `<img src="/mesalista/img/Down.png" alt="Deshabilitar" title="Deshabilitar" class="estado-btn estado-deshabilitar" data-id="${delivery.id}">`
					: `<img src="/mesalista/img/Up.png" alt="Habilitar" title="Habilitar" class="estado-btn estado-habilitar" data-id="${delivery.id}">`
				}
				</td>
				<td>
					<button class="btn-editar" data-id="${delivery.id}">Editar</button>
				</td>
			`;
			tablaBody.appendChild(fila);
		});

		// Asignar eventos a los botones de habilitar/deshabilitar
		document.querySelectorAll(".estado-habilitar").forEach(btn =>
			asignarCambioEstadoDelivery(btn, true)
		);
		document.querySelectorAll(".estado-deshabilitar").forEach(btn =>
			asignarCambioEstadoDelivery(btn, false)
		);
	}

	// Filtros
	btnTodos.addEventListener("click", () => {
		setActive(btnTodos);
		fetchYRenderDeliveries("/mesalista/api/empleado/nivel/3");
	});

	btnActivos.addEventListener("click", () => {
		setActive(btnActivos);
		fetchYRenderDeliveries("/mesalista/api/delivery/estado/true");
	});

	btnInactivos.addEventListener("click", () => {
		setActive(btnInactivos);
		fetchYRenderDeliveries("/mesalista/api/delivery/estado/false");
	});

	function setActive(activeButton) {
		[btnTodos, btnActivos, btnInactivos].forEach(btn => btn.classList.remove("active"));
		activeButton.classList.add("active");
	}

	// Cambiar estado del delivery
	function asignarCambioEstadoDelivery(btn, habilitar) {
		btn.addEventListener("click", () => {
			const id = btn.getAttribute("data-id");
			const url = habilitar
				? `/mesalista/api/delivery/enable/${id}`
				: `/mesalista/api/delivery/${id}`;
			const method = habilitar ? "PUT" : "DELETE";

			fetch(url, { method })
				.then((res) => {
					if (!res.ok) throw new Error("Error al cambiar estado");
					fetchYRenderDeliveries();
				})
				.catch((err) => {
					console.error(err);
					alert("No se pudo cambiar el estado del delivery.");
				});
		});
	}

	window.fetchYRenderDeliveries = fetchYRenderDeliveries;

	fetchYRenderDeliveries();
});
