
let urlActual = "/mesalista/api/empleado";

const tablaCuerpo = document.querySelector("#tabla-empleados tbody");

// Función para obtener y renderizar empleados
function fetchYRenderEmpleados() {
	fetch(urlActual)
		.then((res) => {
			if (!res.ok) throw new Error("Error al obtener empleados");
			return res.json();
		})
		.then((empleados) => renderTablaEmpleados(empleados))
		.catch((err) => {
			console.error(err);
			tablaCuerpo.innerHTML = "<tr><td colspan='10'>Error al cargar empleados</td></tr>";
		});
}

// Función para renderizar la tabla con empleados
function renderTablaEmpleados(empleados) {
	tablaCuerpo.innerHTML = "";

	if (!Array.isArray(empleados)) {
		tablaCuerpo.innerHTML = "<tr><td colspan='10'>Respuesta inválida</td></tr>";
		return;
	}

	empleados.forEach((emp) => {
		const fila = document.createElement("tr");

		fila.innerHTML = `
            <td><input type="text" value="${emp.id}" disabled class="input-id" /></td>
            <td>${emp.nombre}</td>
            <td>${emp.documento}</td>
            <td>${emp.telefono}</td>
            <td>${emp.direccion}</td>
            <td>${nivelTexto(emp.nivel)}</td>
            <td class="estado-td ${emp.estado ? "estado-activo" : "estado-inactivo"}">
                <span class="estado-texto" data-estado="${emp.estado}">
                    ${emp.estado ? "Activo" : "Inactivo"}
                </span>
                ${emp.estado
				? `<img src="/mesalista/img/Down.png" alt="Deshabilitar" title="Deshabilitar" class="estado-btn estado-deshabilitar" data-id="${emp.id}">`
				: `<img src="/mesalista/img/Up.png" alt="Habilitar" title="Habilitar" class="estado-btn estado-habilitar" data-id="${emp.id}">`
			}
            </td>
            <td><button class="btn-editar" data-id="${emp.id}">Editar</button></td>
        `;

		tablaCuerpo.appendChild(fila);
	});

	// Asignar eventos a botones de habilitar/deshabilitar
	document.querySelectorAll(".estado-habilitar").forEach((btn) =>
		asignarCambioEstadoEmpleado(btn, true)
	);
	document.querySelectorAll(".estado-deshabilitar").forEach((btn) =>
		asignarCambioEstadoEmpleado(btn, false)
	);

	// Asignar evento a botones editar
	document.querySelectorAll(".btn-editar").forEach((btn) =>
		asignarEventoEdicionEmpleado(btn)
	);
}

// Texto para niveles
function nivelTexto(nivel) {
	switch (nivel) {
		case 0: return "Administrador";
		case 1: return "Gerente";
		case 2: return "Mesero";
		case 3: return "Delivery";
		case 4: return "Cocina";
		default: return "Desconocido";
	}
}

// Cambiar estado empleado (habilitar / deshabilitar)
function asignarCambioEstadoEmpleado(btn, habilitar) {
	btn.addEventListener("click", () => {
		const id = btn.getAttribute("data-id");
		const urlEstado = habilitar
			? `/mesalista/api/empleado/enable/${id}`
			: `/mesalista/api/empleado/${id}`;
		const method = habilitar ? "PUT" : "DELETE";

		fetch(urlEstado, { method })
			.then((res) => {
				if (!res.ok) throw new Error("Error al cambiar estado");
				fetchYRenderEmpleados();
			})
			.catch((err) => {
				console.error(err);
				alert("Error al cambiar estado del empleado");
			});
	});
}

// Evento para editar empleado
function asignarEventoEdicionEmpleado(btn) {
	btn.addEventListener("click", () => {
		const id = btn.getAttribute("data-id");

		fetch(`/mesalista/api/empleado/${id}`)
			.then(res => {
				if (!res.ok) throw new Error("Empleado no encontrado");
				return res.json();
			})
			.then(emp => {
				// Aquí debes abrir tu modal de edición y llenar el formulario
				// por ejemplo:
				document.getElementById('edit-nombre').value = emp.nombre || '';
				document.getElementById('edit-documento').value = emp.documento || '';
				document.getElementById('edit-telefono').value = emp.telefono || '';
				document.getElementById('edit-direccion').value = emp.direccion || '';
				document.getElementById('edit-nivel').value = [0, 1, 2, 3, 4].includes(emp.nivel) ? emp.nivel : 2;

				const estadoInput = document.getElementById('edit-estado');
				estadoInput.value = emp.estado ? 'Activo' : 'Inactivo';
				estadoInput.classList.remove('estado-activo', 'estado-inactivo');
				estadoInput.classList.add(emp.estado ? 'estado-activo' : 'estado-inactivo');

				const popupOverlay = document.getElementById('edit-employee-popup');
				popupOverlay.style.display = 'flex';

				const closeBtn = document.getElementById('edit-employee-close');

				function cerrarPopup() {
					popupOverlay.style.display = 'none';
					form.removeEventListener("submit", window.submitHandler);
				}

				closeBtn.onclick = cerrarPopup;

				const form = document.getElementById('edit-employee-form');

				if (window.submitHandler) {
					form.removeEventListener("submit", window.submitHandler);
				}

				window.submitHandler = function(e) {
					e.preventDefault();

					const nombre = document.getElementById('edit-nombre').value;
					const documento = document.getElementById('edit-documento').value;
					const telefono = document.getElementById('edit-telefono').value;
					const direccion = document.getElementById('edit-direccion').value;
					const nivel = parseInt(document.getElementById('edit-nivel').value);

					const empleadoActualizado = {
						nombre,
						documento,
						telefono,
						direccion,
						nivel,
						estado: emp.estado
					};

					const endpoint = `/mesalista/api/empleado/${id}`;

					fetch(endpoint, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(empleadoActualizado)
					})
						.then(res => {
							if (!res.ok) throw new Error("No se pudo actualizar el empleado");
							return res.json();
						})
						.then(() => {
							cerrarPopup();
							fetchYRenderEmpleados();
						})
						.catch(err => {
							console.error(err);
							alert("Error al actualizar el empleado.");
						});
				};

				form.addEventListener("submit", window.submitHandler);
			})
			.catch(err => {
				console.error(err);
				alert("No se pudo obtener el empleado.");
			});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	const btnTodos = document.getElementById("btn-todos-empleados");
	const btnActivos = document.getElementById("btn-activos-empleados");
	const btnInactivos = document.getElementById("btn-inactivos-empleados");

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
		[btnTodos, btnActivos, btnInactivos].forEach((btn) =>
			btn.classList.remove("active")
		);
		boton.classList.add("active");
	}

	// fetchYRenderEmpleados(); // carga inicial
});

function autenticarEmpleado() {
	const id = document.getElementById("auth-id").value;
	const clave = document.getElementById("auth-clave").value;
	const errorMsg = document.getElementById("auth-error");

	if (!id || !clave) {
		errorMsg.textContent = "Por favor, complete ambos campos";
		errorMsg.style.display = "block";
		return;
	}

	fetch("/mesalista/api/empleado/validar", {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify({ id: parseInt(id), clave: clave })
	})
	.then(res => {
	    if (!res.ok) throw new Error("Error en autenticación");
	    return res.json();
	})
	.then(data => {
	    if (data.p_es_valido === true) {
	        document.getElementById("auth-modal-unico").style.display = "none";
	        fetchYRenderEmpleados();
	    } else {
	        errorMsg.textContent = data.p_mensaje || "Credenciales inválidas";
	        errorMsg.style.display = "block";
	    }
	})
	.catch(err => {
	    console.error(err);
	    errorMsg.textContent = "Error al autenticar";
	    errorMsg.style.display = "block";
	});


}

document.addEventListener("DOMContentLoaded", () => {
	// Mostrar el modal de autenticación primero
	document.getElementById("auth-modal-unico").style.display = "flex";
	document.getElementById("btn-auth-login").addEventListener("click", autenticarEmpleado);
});

document.getElementById("btn-auth-regresar").addEventListener("click", () => {
    history.back();
});

// Exportar funciones a ventana global para uso en otros archivos
window.fetchYRenderEmpleados = fetchYRenderEmpleados;
window.renderTablaEmpleados = renderTablaEmpleados;
window.tablaCuerpo = tablaCuerpo;
