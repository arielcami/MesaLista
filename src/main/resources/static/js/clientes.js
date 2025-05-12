document.addEventListener("DOMContentLoaded", () => {
    const btnTodos = document.getElementById('btn-todos');
    //const btnActivos = document.getElementById('btn-activos');
    //const btnInactivos = document.getElementById('btn-inactivos');
    const btnNuevoCliente = document.getElementById('btn-nuevo-cliente');

    // Manejo del popup de edición
    const editPopupOverlay = document.getElementById('edit-popup-overlay');
    const editCloseBtn = document.getElementById('edit-close-btn');
    const editClientForm = document.getElementById('edit-client-form');

    const editNombre = document.getElementById('edit-nombre');
    const editTelefono = document.getElementById('edit-telefono');
    //const editEstado = document.getElementById('edit-estado');

    const clientesTableBody = document.querySelector('.tabla-clientes tbody'); // Referencia al tbody de la tabla

    // Función para cargar la lista de clientes
    const cargarClientes = (url) => {
        fetch(url)
            .then(response => response.json())
            .then(clientes => {
				
                // Limpiar la tabla antes de insertar nuevos datos
                clientesTableBody.innerHTML = '';
				
				
				// Insertar cada cliente en la tabla
				clientes.forEach(cliente => {
				    const row = document.createElement('tr');

				    row.innerHTML = `
				        <td><input type="text" value="${cliente.id}" disabled class="input-id" /></td>
				        <td class="nombre">${cliente.nombre}</td>
				        <td class="telefono">${cliente.telefono}</td>
				        <td>
				            <button class="btn-editar" data-id="${cliente.id}">Editar</button>
				        </td>
				    `;

				    // Agregar la fila a la tabla
				    clientesTableBody.appendChild(row);
				});

                // Volver a asignar los eventos de edición y de cambio de estado
                agregarEventosEdicion();
            })
            .catch(err => {
                console.error('Error al obtener los clientes:', err);
                alert('No se pudieron cargar los clientes');
            });
    };

    // Cargar todos los clientes al iniciar
    cargarClientes('/mesalista/api/cliente');

    // Función para agregar eventos de edición
    const agregarEventosEdicion = () => {
        const btnEditar = document.querySelectorAll('.btn-editar');
        btnEditar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clienteId = e.target.getAttribute('data-id');

                // Llamar a la API para obtener los datos del cliente
                fetch(`/mesalista/api/cliente/${clienteId}`)
                    .then(response => response.json())
                    .then(cliente => {
                        editNombre.value = cliente.nombre;
                        editTelefono.value = cliente.telefono;
                        
                        // Guardar el ID del cliente en el formulario para enviarlo con los cambios
                        editClientForm.setAttribute('data-id', cliente.id);

                        // Mostrar el popup
                        editPopupOverlay.style.display = 'flex';
                    })
                    .catch(err => console.error('Error al obtener cliente:', err));
            });
        });
    };


    // Enviar los cambios del cliente
    editClientForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const clienteId = editClientForm.getAttribute('data-id');
        const updatedCliente = {
            id: clienteId,
            nombre: editNombre.value,
            telefono: editTelefono.value
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
            alert("Cliente actualizado exitosamente");
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
});
