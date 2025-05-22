let urlActual = "/mesalista/api/delivery";

document.addEventListener('deliveryCreado', () => {
	fetchYRenderDelivery();
});

document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('auth-modal-unico');
	const btnLogin = document.getElementById('btn-auth-login');
	const btnRegresar = document.getElementById('btn-auth-regresar');
	const errorMsg = document.getElementById('auth-error');
	const authId = document.getElementById('auth-id');
	const authClave = document.getElementById('auth-clave');
	const mainContent = document.querySelector('main');
	const filtroBotones = document.querySelector('.filtro-botones');
	const tablaContainer = document.querySelector('.tabla-delivery-container');

	// Botones filtro
	const btnTodos = document.getElementById("btn-todos-delivery");
	const btnActivos = document.getElementById("btn-activos-delivery");
	const btnInactivos = document.getElementById("btn-inactivos-delivery");

	// Al inicio todo está oculto excepto el modal
	mainContent.style.display = 'none';
	filtroBotones.style.display = 'none';
	tablaContainer.style.display = 'none';

	btnLogin.addEventListener('click', async () => {
		const idStr = authId.value.trim();
		const clave = authClave.value.trim();

		// Convertir id a número entero
		const id = parseInt(idStr, 10);

		if (isNaN(id) || !clave) {
			errorMsg.textContent = 'Por favor ingresa un ID numérico válido y clave';
			errorMsg.style.display = 'block';
			return;
		}

		try {
			const response = await fetch('/mesalista/api/empleado/validar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, clave }),
			});

			if (!response.ok) throw new Error('Credenciales inválidas');

			const data = await response.json();

			if (data.p_es_valido === true) {
				modal.style.display = 'none';
				mainContent.style.display = 'block';
				filtroBotones.style.display = 'flex';
				tablaContainer.style.display = 'block';

				// Marcar botón activo por defecto (Todos)
				marcarBotonActivo(btnTodos);

				// Cargar datos inicialmente
				fetchYRenderDelivery();
			} else {
				errorMsg.textContent = data.p_mensaje || 'Datos incorrectos';
				errorMsg.style.display = 'block';
			}
		} catch (error) {
			errorMsg.textContent = error.message;
			errorMsg.style.display = 'block';
		}
	});

	btnRegresar.addEventListener('click', () => {
		authId.value = '';
		authClave.value = '';
		errorMsg.style.display = 'none';
	});

	// Agregar listeners para botones filtro si existen
	if (btnTodos && btnActivos && btnInactivos) {
		btnTodos.addEventListener("click", () => {
			urlActual = "/mesalista/api/delivery";
			marcarBotonActivo(btnTodos);
			fetchYRenderDelivery();
		});

		btnActivos.addEventListener("click", () => {
			urlActual = "/mesalista/api/delivery/estado/true";
			marcarBotonActivo(btnActivos);
			fetchYRenderDelivery();
		});

		btnInactivos.addEventListener("click", () => {
			urlActual = "/mesalista/api/delivery/estado/false";
			marcarBotonActivo(btnInactivos);
			fetchYRenderDelivery();
		});
	}

	function marcarBotonActivo(boton) {
		[btnTodos, btnActivos, btnInactivos].forEach((btn) => {
			if (btn) btn.classList.remove("active");
		});
		if (boton) boton.classList.add("active");
	}
});

const tablaCuerpo = document.querySelector("#tabla-delivery tbody");

// Función para obtener y renderizar delivery
function fetchYRenderDelivery() {
	fetch(urlActual)
		.then((res) => {
			if (!res.ok) throw new Error("Error al obtener delivery");
			return res.json();
		})
		.then((deliveries) => renderTablaDelivery(deliveries))
		.catch((err) => {
			console.error(err);
			tablaCuerpo.innerHTML = "<tr><td colspan='9'>Error al cargar delivery</td></tr>";
		});
}

// Función para renderizar la tabla con delivery
function renderTablaDelivery(deliveries) {
	tablaCuerpo.innerHTML = "";

	if (!Array.isArray(deliveries)) {
		tablaCuerpo.innerHTML = "<tr><td colspan='9'>Respuesta inválida</td></tr>";
		return;
	}

	deliveries.forEach((d) => {
		const fila = document.createElement("tr");

		fila.innerHTML = `
      <td><input type="text" value="${d.id}" disabled class="input-id" /></td>
      <td>${d.nombre}</td>
      <td>${d.documento}</td>
      <td>${d.unidad || ''}</td>
      <td>${d.placa || ''}</td>
      <td class="estado-td ${d.estado ? "estado-activo" : "estado-inactivo"}">
        <span class="estado-texto" data-estado="${d.estado}">
          ${d.estado ? "Activo" : "Inactivo"}
        </span>
        ${d.estado
				? `<img src="/mesalista/img/Down.png" alt="Deshabilitar" title="Deshabilitar" class="estado-btn estado-deshabilitar" data-id="${d.id}">`
				: `<img src="/mesalista/img/Up.png" alt="Habilitar" title="Habilitar" class="estado-btn estado-habilitar" data-id="${d.id}">`
			}
      </td>
      <td><button class="btn-editar" data-id="${d.id}">Editar</button></td>
    `;

		tablaCuerpo.appendChild(fila);
	});

	// Asignar eventos a botones de habilitar/deshabilitar
	document.querySelectorAll(".estado-habilitar").forEach((btn) =>
		asignarCambioEstadoDelivery(btn, true)
	);
	document.querySelectorAll(".estado-deshabilitar").forEach((btn) =>
		asignarCambioEstadoDelivery(btn, false)
	);

	// Asignar evento a botones editar
	document.querySelectorAll(".btn-editar").forEach((btn) =>
		asignarEventoEdicionDelivery(btn)
	);
}

// Cambiar estado delivery (habilitar / deshabilitar)
function asignarCambioEstadoDelivery(btn, habilitar) {
	btn.addEventListener("click", () => {
		const id = btn.getAttribute("data-id");
		const urlEstado = habilitar
			? `/mesalista/api/delivery/enable/${id}`
			: `/mesalista/api/delivery/${id}`;
		const method = habilitar ? "PUT" : "DELETE";

		fetch(urlEstado, { method })
			.then((res) => {
				if (!res.ok) throw new Error("Error al cambiar estado");
				fetchYRenderDelivery();
			})
			.catch((err) => {
				console.error(err);
				alert("Error al cambiar estado del delivery");
			});
	});
}

// Evento para editar delivery
function asignarEventoEdicionDelivery(btn) {
	btn.addEventListener("click", () => {
		const id = btn.getAttribute("data-id");

		fetch(`/mesalista/api/delivery/${id}`)
			.then((res) => {
				if (!res.ok) throw new Error("Delivery no encontrado");
				return res.json();
			})
			.then((d) => {
				// Rellenar formulario edición con datos recibidos
				document.getElementById('edit-id').value = d.id || '';
				document.getElementById('edit-nombre').value = d.nombre || '';
				document.getElementById('edit-unidad').value = d.unidad || 'Moto';
				document.getElementById('edit-placa').value = d.placa || '';

				const estadoInput = document.getElementById('edit-estado');
				estadoInput.value = d.estado ? 'Activo' : 'Inactivo';
				estadoInput.classList.remove('estado-activo', 'estado-inactivo');
				estadoInput.classList.add(d.estado ? 'estado-activo' : 'estado-inactivo');

				const popupOverlay = document.getElementById('edit-delivery-popup');
				popupOverlay.style.display = 'flex';

				const closeBtn = document.getElementById('edit-delivery-close');

				function cerrarPopup() {
					popupOverlay.style.display = 'none';
					form.removeEventListener("submit", window.submitHandlerDelivery);
				}

				closeBtn.onclick = cerrarPopup;

				const form = document.getElementById('edit-delivery-form');

				if (window.submitHandlerDelivery) {
					form.removeEventListener("submit", window.submitHandlerDelivery);
				}

				window.submitHandlerDelivery = function(e) {
					e.preventDefault();

					const unidad = document.getElementById('edit-unidad').value;
					const placa = document.getElementById('edit-placa').value;

					const deliveryActualizado = {
						unidad,
						placa,
						estado: d.estado
					};

					const endpoint = `/mesalista/api/delivery/${id}`;

					fetch(endpoint, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(deliveryActualizado),
					})
						.then((res) => {
							if (!res.ok) throw new Error("Error al actualizar delivery");
							alert("Delivery actualizado con éxito");
							cerrarPopup();
							fetchYRenderDelivery();
						})
						.catch((err) => {
							console.error(err);
							alert("Error al actualizar delivery");
						});
				};

				form.addEventListener("submit", window.submitHandlerDelivery);
			})
			.catch((err) => {
				console.error(err);
				alert("Error al cargar datos del delivery");
			});
	});
}

// Abrir popup creación delivery
document.getElementById('btn-nuevo-delivery').addEventListener('click', () => {
	document.getElementById('create-delivery-popup').style.display = 'flex';
});

// Cerrar popup creación
document.getElementById('create-delivery-close').addEventListener('click', () => {
	document.getElementById('create-delivery-popup').style.display = 'none';
});

// Cerrar popup edición
document.getElementById('edit-delivery-close').addEventListener('click', () => {
	document.getElementById('edit-delivery-popup').style.display = 'none';
});

// Crear delivery
document.getElementById('create-delivery-form').addEventListener('submit', (e) => {
	e.preventDefault();

	const nuevoDelivery = {
		nombre: document.getElementById('create-nombre').value.trim(),
		documento: document.getElementById('create-documento').value.trim(),
		telefono: document.getElementById('create-telefono').value.trim(),
		direccion: document.getElementById('create-direccion').value.trim(),
		clave: document.getElementById('create-clave').value,
		nivel: 3 // hardcoded nivel delivery
	};

	fetch('/mesalista/api/delivery', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(nuevoDelivery),
	})
		.then(res => {
			if (!res.ok) throw new Error("Error al crear delivery");
			alert("Delivery creado con éxito");
			document.getElementById('create-delivery-popup').style.display = 'none';
			e.target.reset();
			fetchYRenderDelivery();
		})
		.catch(err => {
			console.error(err);
			alert("Error al crear delivery");
		});
});
