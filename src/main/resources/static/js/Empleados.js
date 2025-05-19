let urlActual = "/mesalista/api/empleado";

document.addEventListener("DOMContentLoaded", () => {
	const tablaCuerpo = document.querySelector("#tabla-empleados tbody");
	const btnTodos = document.getElementById("btn-todos-empleados");
	const btnActivos = document.getElementById("btn-activos-empleados");
	const btnInactivos = document.getElementById("btn-inactivos-empleados");

	// Eventos para filtros
	if (btnTodos && btnActivos && btnInactivos) {
		btnTodos.addEventListener("click", () => {
			urlActual = "/mesalista/api/empleado";
			marcarBotonActivo(btnTodos);
			fetchYRenderEmpleados();
		});

		btnActivos.addEventListener("click", () => {
			urlActual = "/mesalista/api/empleado/estado/true";
			marcarBotonActivo(btnActivos);
			fetchYRenderEmpleados();
		});

		btnInactivos.addEventListener("click", () => {
			urlActual = "/mesalista/api/empleado/estado/false";
			marcarBotonActivo(btnInactivos);
			fetchYRenderEmpleados();
		});
	}

	function marcarBotonActivo(boton) {
		[btnTodos, btnActivos, btnInactivos].forEach(btn => btn.classList.remove("active"));
		boton.classList.add("active");
	}

	fetchYRenderEmpleados(); // carga inicial

	function fetchYRenderEmpleados() {
		fetch(urlActual)
			.then(res => {
				if (!res.ok) throw new Error("Error al obtener empleados");
				return res.json();
			})
			.then(empleados => renderTablaEmpleados(empleados))
			.catch(err => {
				console.error(err);
				tablaCuerpo.innerHTML = "<tr><td colspan='10'>Error al cargar empleados</td></tr>";
			});
	}

	function renderTablaEmpleados(empleados) {
		tablaCuerpo.innerHTML = "";

		if (!Array.isArray(empleados)) {
			tablaCuerpo.innerHTML = "<tr><td colspan='10'>Respuesta inválida</td></tr>";
			return;
		}

		empleados.forEach(emp => {
			const fila = document.createElement("tr");

			fila.innerHTML = `
				<td><input type="text" value="${emp.id}" disabled class="input-id" /></td>
				<td>${emp.nombre}</td>
				<td>${emp.documento}</td>
				<td>${emp.telefono}</td>
				<td>${emp.direccion}</td>
				<td>${nivelTexto(emp.nivel)}</td>
				<td class="estado-td ${emp.estado ? 'estado-activo' : 'estado-inactivo'}">
					<span class="estado-texto" data-estado="${emp.estado}">
						${emp.estado ? 'Activo' : 'Inactivo'}
					</span>
					${emp.estado
						? `<img src="/mesalista/img/Down.png" alt="Deshabilitar" title="Deshabilitar"
								class="estado-btn estado-deshabilitar" data-id="${emp.id}">`
						: `<img src="/mesalista/img/Up.png" alt="Habilitar" title="Habilitar"
								class="estado-btn estado-habilitar" data-id="${emp.id}">`
					}
				</td>
				<td>${emp.unidad || ""}</td>
				<td>${emp.placa || ""}</td>
				<td><button class="btn-editar" data-id="${emp.id}">Editar</button></td>
			`;

			tablaCuerpo.appendChild(fila);
		});

		document.querySelectorAll(".estado-habilitar").forEach(btn => asignarCambioEstadoEmpleado(btn, true));
		document.querySelectorAll(".estado-deshabilitar").forEach(btn => asignarCambioEstadoEmpleado(btn, false));
	}
});

// ✅ Esta función la debes mantener
function nivelTexto(nivel) {
	switch (nivel) {
		case 0: return "Administrador";
		case 1: return "Gerente";
		case 2: return "Empleado";
		case 3: return "Delivery";
		default: return "Desconocido";
	}
}

// ✅ Esta también, para que Activar/Desactivar no recargue
function asignarCambioEstadoEmpleado(btn, activar) {
	btn.addEventListener("click", () => {
		const id = btn.getAttribute("data-id");

		const url = activar
			? `/mesalista/api/empleado/enable/${id}`
			: `/mesalista/api/empleado/${id}`;
		const metodo = activar ? "PUT" : "DELETE";

		fetch(url, { method: metodo })
			.then(res => {
				if (!res.ok) throw new Error("No se pudo cambiar el estado del empleado.");
				return res.text(); // Por si la respuesta está vacía
			})
			.then(() => {
				const fila = btn.closest("tr");
				const tdEstado = fila.querySelector(".estado-td");
				const spanTexto = tdEstado.querySelector(".estado-texto");

				tdEstado.classList.toggle("estado-activo", activar);
				tdEstado.classList.toggle("estado-inactivo", !activar);

				spanTexto.textContent = activar ? "Activo" : "Inactivo";
				spanTexto.setAttribute("data-estado", activar);

				const nuevoBtn = document.createElement("img");
				nuevoBtn.src = activar ? "/mesalista/img/Down.png" : "/mesalista/img/Up.png";
				nuevoBtn.alt = activar ? "Deshabilitar" : "Habilitar";
				nuevoBtn.title = activar ? "Deshabilitar" : "Habilitar";
				nuevoBtn.className = `estado-btn ${activar ? "estado-deshabilitar" : "estado-habilitar"}`;
				nuevoBtn.setAttribute("data-id", id);

				btn.replaceWith(nuevoBtn);
				asignarCambioEstadoEmpleado(nuevoBtn, !activar);
			})
			.catch(err => {
				console.error(err);
				alert("Error al cambiar estado del empleado.");
			});
	});
}
