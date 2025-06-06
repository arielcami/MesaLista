document.addEventListener("DOMContentLoaded", () => {

	const btnTodos = document.getElementById('btn-todos');
	const btnNuevoCliente = document.getElementById('btn-nuevo-cliente');

	// Elementos de edición
	const editPopupOverlay = document.getElementById('edit-popup-overlay');
	const editCloseBtn = document.getElementById('edit-close-btn');
	const editClientForm = document.getElementById('edit-client-form');

	const editNombre = document.getElementById('edit-nombre');
	const editTelefono = document.getElementById('edit-telefono');
	const editDocumento = document.getElementById('edit-documento');
	const editDireccion = document.getElementById('edit-direccion');

	const clientesTableBody = document.querySelector('.tabla-clientes tbody');

	// Cargar clientes
	window.cargarClientes = (url) => {
		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error("Error al obtener clientes.");
				}
				return response.json();
			})
			.then(clientes => {
				clientesTableBody.innerHTML = '';
				clientes.forEach(cliente => {
					const row = document.createElement('tr');
					row.innerHTML = `
				        <td><input type="text" value="${cliente.id}" disabled class="input-id" name="cliente-id-unico"/></td>
				        <td class="nombre">${cliente.nombre}</td>
						<td class="telefono">${cliente.telefono}</td>
						<td class="documento">${cliente.documento}</td>
						<td class="direccion">${cliente.direccion}</td>
				        <td><button class="btn-editar" data-id="${cliente.id}">Editar</button></td>`;
					clientesTableBody.appendChild(row);
				});
				agregarEventosEdicion();
			})
			.catch(err => {
				mostrarPopupConfirmacion("error", "No se pudieron cargar los clientes.");
				// console.error(err);
			});
	};

	// Cargar al iniciar
	cargarClientes('/mesalista/api/cliente');

	// Función para editar clientes
	function agregarEventosEdicion() {
		const btnEditar = document.querySelectorAll('.btn-editar');
		btnEditar.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const clienteId = e.target.getAttribute('data-id');
				fetch(`/mesalista/api/cliente/${clienteId}`)
					.then(response => {
						if (!response.ok) {
							throw new Error("No se pudo obtener el cliente.");
						}
						return response.json();
					})
					.then(cliente => {
						editNombre.value = cliente.nombre;
						editTelefono.value = cliente.telefono;
						editDocumento.value = cliente.documento;
						editDireccion.value = cliente.direccion;
						editClientForm.setAttribute('data-id', cliente.id);
						editPopupOverlay.classList.add('show');
					})
					.catch(err => {
						mostrarPopupConfirmacion("error", "Error al obtener cliente.");
						// console.error(err);
					});
			});
		});
	}
	window.agregarEventosEdicion = agregarEventosEdicion;

	// Guardar cambios
	editClientForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const clienteId = editClientForm.getAttribute('data-id');

		const updatedCliente = {
			id: clienteId,
			nombre: editNombre.value,
			telefono: editTelefono.value,
			documento: editDocumento.value,
			direccion: editDireccion.value
		};

		fetch(`/mesalista/api/cliente/${clienteId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedCliente),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("Error al actualizar cliente.");
				}
				return response.json();
			})
			.then(data => {
				editPopupOverlay.classList.remove('show');
				mostrarPopupConfirmacion("success", "Cliente actualizado correctamente.", () => {
					cargarClientes('/mesalista/api/cliente');
				});
			})
			.catch(err => {
				// console.error('Error al actualizar cliente:', err);
				mostrarPopupConfirmacion("error", "No se pudo actualizar el cliente.");
			});
	});

	// Cierre del popup de edición
	document.addEventListener('click', function(e) {
		if (e.target.id === 'edit-close-btn') {
			editPopupOverlay.classList.remove('show');
		}
	});
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') {
			editPopupOverlay.classList.remove('show');
		}
	});
});
