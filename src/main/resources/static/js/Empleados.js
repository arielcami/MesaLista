document.addEventListener("DOMContentLoaded", () => {
	const tablaCuerpo = document.querySelector("#tabla-empleados tbody");
	const URL = "/mesalista/api/empleado";

	// console.log("Iniciando fetch de empleados en:", URL);

	fetch(URL)
		.then(response => {
			// console.log("Respuesta del servidor:", response);
			if (!response.ok) {
				throw new Error("Error al obtener empleados: " + response.status);
			}
			return response.json();
		})
		.then(empleados => {
			// console.log("Datos JSON recibidos:", empleados);

			if (!Array.isArray(empleados)) {
				console.error("Error: la respuesta no es un arreglo");
				tablaCuerpo.innerHTML = "<tr><td colspan='10'>Respuesta inválida del servidor.</td></tr>";
				return;
			}

			tablaCuerpo.innerHTML = "";

			empleados.forEach(emp => {
				// console.log("Empleado procesado:", emp);
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
					<td>
						<button class="btn-editar" data-id="${emp.id}">Editar</button>
					</td>
				`;

				tablaCuerpo.appendChild(fila);
			});

			// Asignar eventos luego del renderizado
			document.querySelectorAll(".estado-habilitar").forEach(btn => asignarCambioEstadoEmpleado(btn, true));
			document.querySelectorAll(".estado-deshabilitar").forEach(btn => asignarCambioEstadoEmpleado(btn, false));
		})
		.catch(error => {
			console.error("Error al cargar empleados:", error);
			tablaCuerpo.innerHTML = "<tr><td colspan='10'>No se pudieron cargar los empleados.</td></tr>";
		});
});

function nivelTexto(nivel) {
	switch (nivel) {
		case 0: return "Administrador";
		case 1: return "Gerente";
		case 2: return "Empleado";
		case 3: return "Delivery";
		default: return "Desconocido";
	}
}

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
				// Actualizar la fila sin recargar
				const fila = btn.closest("tr");

				const tdEstado = fila.querySelector(".estado-td");
				const spanTexto = tdEstado.querySelector(".estado-texto");

				// Actualizar clase del <td>
				tdEstado.classList.toggle("estado-activo", activar);
				tdEstado.classList.toggle("estado-inactivo", !activar);

				// Actualizar texto
				spanTexto.textContent = activar ? "Activo" : "Inactivo";
				spanTexto.setAttribute("data-estado", activar);

				// Reemplazar el ícono
				const nuevoBtn = document.createElement("img");
				nuevoBtn.src = activar ? "/mesalista/img/Down.png" : "/mesalista/img/Up.png";
				nuevoBtn.alt = activar ? "Deshabilitar" : "Habilitar";
				nuevoBtn.title = activar ? "Deshabilitar" : "Habilitar";
				nuevoBtn.className = `estado-btn ${activar ? "estado-deshabilitar" : "estado-habilitar"}`;
				nuevoBtn.setAttribute("data-id", id);

				// Reemplazar el botón viejo
				btn.replaceWith(nuevoBtn);

				// Reasignar evento al nuevo botón
				asignarCambioEstadoEmpleado(nuevoBtn, !activar);
			})
			.catch(err => {
				console.error(err);
				alert("Error al cambiar estado del empleado.");
			});
	});
}
