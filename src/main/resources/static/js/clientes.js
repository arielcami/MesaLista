document.addEventListener("DOMContentLoaded", () => {

	const btnTodos = document.getElementById('btn-todos');
	const btnNuevoCliente = document.getElementById('btn-nuevo-cliente');

	// Manejo del popup de edición
	const editPopupOverlay = document.getElementById('edit-popup-overlay');
	const editCloseBtn = document.getElementById('edit-close-btn');
	const editClientForm = document.getElementById('edit-client-form');

	const editNombre = document.getElementById('edit-nombre');
	const editTelefono = document.getElementById('edit-telefono');
	const editDocumento = document.getElementById('edit-documento');
	const editDireccion = document.getElementById('edit-direccion');

	const clientesTableBody = document.querySelector('.tabla-clientes tbody'); // Referencia al tbody de la tabla


	// Función para cargar la lista de clientes
	window.cargarClientes = (url) => {
		fetch(url)
			.then(response => response.json())
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
				window.agregarEventosEdicion();
			})
			.catch(err => {
				console.error('Error al obtener los clientes:', err);
				alert('No se pudieron cargar los clientes');
			});
	};

	// Cargar todos los clientes al iniciar
	cargarClientes('/mesalista/api/cliente');

	// Función para agregar eventos de edición
	window.agregarEventosEdicion = () => {
		const btnEditar = document.querySelectorAll('.btn-editar');
		btnEditar.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const clienteId = e.target.getAttribute('data-id');
				fetch(`/mesalista/api/cliente/${clienteId}`)
					.then(response => response.json())
					.then(cliente => {
						editNombre.value = cliente.nombre;
						editTelefono.value = cliente.telefono;
						editDocumento.value = cliente.documento;
						editDireccion.value = cliente.direccion;
						editClientForm.setAttribute('data-id', cliente.id);
						editPopupOverlay.style.display = 'flex';
					})
					.catch(err => console.error('Error al obtener cliente:', err));
			});
		});
	};

	// Exportar la función para que sea accesible globalmente
	window.agregarEventosEdicion = agregarEventosEdicion;

	// Enviar los cambios del cliente
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

		// Enviar la solicitud PUT para actualizar el cliente
		fetch(`/mesalista/api/cliente/${clienteId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedCliente),
		})
			.then(response => response.json())
			.then(data => {
				//alert("Cliente actualizado exitosamente");
				// Cerrar el popup
				editPopupOverlay.style.display = 'none';
				// Recargar la página o actualizar la tabla de clientes
				cargarClientes('/mesalista/api/cliente');
			})
			.catch(err => {
				console.error('Error al actualizar cliente:', err);
				alert('No se pudo actualizar el cliente');
			});
	});

	// Cerrar boton
	document.addEventListener('click', function(e) {
		// Cerrar al hacer clic en el botón "Cerrar"
		if (e.target.id === 'edit-close-btn') {
			editPopupOverlay.style.display = 'none';
		}

		// Cerrar al hacer clic fuera del formulario (clic en el overlay)
		if (e.target === editPopupOverlay) {
			editPopupOverlay.style.display = 'none';
		}
	});

	document.addEventListener('keydown', function(e) {
		// Cerrar al presionar la tecla Escape
		if (e.key === 'Escape') {
			editPopupOverlay.style.display = 'none';
		}
	});

});
