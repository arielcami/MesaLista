function mostrarVerificacionEmpleado() {
	const modal = document.getElementById('verificacion-empleado-modal');
	document.getElementById('empleado-id-input').value = '';
	document.getElementById('empleado-clave-input').value = '';
	modal.style.display = 'flex';
	document.getElementById('empleado-id-input').focus();
}

function mostrarDetalleModal(mesa) {
	const fechaPedido = mesa.pedido?.fechaPedido ? new Date(mesa.pedido.fechaPedido) : null;
	document.getElementById('modal-fecha').textContent = fechaPedido
		? fechaPedido.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		}).toUpperCase()
		: '—';

	document.getElementById('modal-cliente-nombre').textContent = mesa.cliente?.nombre || '—';
	document.getElementById('modal-empleado-nombre').textContent = mesa.pedido?.empleado?.nombre || '—';

	const productosList = document.getElementById('modal-productos-list');
	productosList.innerHTML = '';

	let total = 0;

	mesa.pedido.detalles.forEach(det => {
		const subtotal = det.cantidad * det.precioUnitario;
		total += subtotal;

		const li = document.createElement('li');
		li.textContent = `${det.cantidad}x ${det.producto.nombre} (S/ ${det.precioUnitario.toFixed(2)} c/u)` +
			(det.comentario ? ` - ${det.comentario}` : '');
		productosList.appendChild(li);
	});

	const totalLi = document.createElement('li');
	totalLi.style.marginTop = '10px';
	totalLi.style.fontWeight = 'bold';
	totalLi.textContent = `Total: S/ ${total.toFixed(2)}`;
	productosList.appendChild(totalLi);

	document.getElementById('pedido-modal').style.display = 'flex';
}

function showEstadoMenu({ x, y, currentEstado, mesaId }) {
	const menu = document.getElementById('estado-context-menu');
	if (!menu) return;

	menu.innerHTML = '';

	const opciones = [
		{
			label: 'Asignar cliente',
			visible: currentEstado === 1,
			action: () => {
				showClienteSearchModal(mesaId);
			}
		},
		{
			label: 'Desocupar',
			visible: currentEstado === 2,
			action: () => {
				desalojarMesa(mesaId);
			}
		},
		{
			label: 'Mover cliente',
			visible: currentEstado === 2,
			action: () => {
				const mesaEl = document.querySelector(`.mesa[data-id="${mesaId}"]`);
				const clienteId = mesaEl?.getAttribute('data-cliente');

				if (!clienteId) {
					mostrarPopupConfirmacion('Error', 'No se pudo obtener el cliente de esta mesa.');
					return;
				}

				moverCliente(parseInt(clienteId), mesaId);
			}
		},
		{
			label: 'Clausurar',
			visible: currentEstado === 1,
			action: () => {
				cerrarMesa(mesaId);
			}
		},
		{
			label: 'Habilitar',
			visible: currentEstado === 0,
			action: () => {
				aperturarMesa(mesaId);
			}
		},
		{
			label: 'Eliminar',
			visible: currentEstado != 2,
			action: () => {
				eliminarMesa(mesaId);
			}
		}

	];

	opciones.filter(o => o.visible).forEach(opcion => {
		const item = document.createElement('div');
		item.className = 'context-menu-item';
		item.textContent = opcion.label;
		item.addEventListener('click', () => {
			opcion.action();
			hideMenu();
		});
		menu.appendChild(item);
	});

	menu.style.display = 'block';
	menu.style.left = `${x}px`;
	menu.style.top = `${y}px`;
}

function hideMenu() {
	const menu = document.getElementById('estado-context-menu');
	if (menu) menu.style.display = 'none';
}

let mesaSeleccionadaId = null;
let clienteSeleccionadoId = null;

function showClienteSearchModal(mesaId) {
	const popup = document.getElementById('cliente-modal');
	const input = document.getElementById('cliente-busqueda');
	const resultList = document.getElementById('cliente-resultados');

	popup.style.display = 'flex';
	input.value = '';
	resultList.innerHTML = '';
	input.focus();

	input.oninput = function() {
		const query = this.value.trim();
		if (query.length >= 2) {
			fetch(`/mesalista/api/cliente/nombre/${encodeURIComponent(query)}`)
				.then(res => res.json())
				.then(clientes => {
					resultList.innerHTML = '';
					clientes.forEach(cliente => {
						const item = document.createElement('div');
						item.className = 'popup-search-item';
						item.textContent = cliente.nombre + ' — ' + cliente.documento;

						item.addEventListener('click', () => {
							// Guardamos la selección
							mesaSeleccionadaId = mesaId;
							clienteSeleccionadoId = cliente.id;

							// Cerramos el buscador y abrimos el modal de verificación
							popup.style.display = 'none';
							mostrarVerificacionEmpleado();
						});

						resultList.appendChild(item);
					});
				})
				.catch(err => console.error('Error buscando clientes:', err));
		} else {
			resultList.innerHTML = '';
		}
	};
}

function asignarClienteAMesa(mesaId, clienteId) {

	const mesaDiv = document.querySelector(`.mesa[data-id="${mesaId}"]`);
	if (!mesaDiv) {
		console.error('No se encontró la mesa en el DOM');
		return;
	}

	// Obtener datos de la mesa desde el array original cargado al inicio
	const mesa = window.mesasCargadas?.find(m => m.id === parseInt(mesaId));
	if (!mesa || !mesa.pedido || !mesa.pedido.empleado || !mesa.pedido.empleado.id) {
		mostrarPopupConfirmacion('Error', 'No se puede asignar el cliente: falta información del mesero asignado.');
		return;
	}

	const empleadoId = mesa.pedido.empleado.id;

	fetch(`/mesalista/api/mesa/asignar?mesaId=${mesaId}&clienteId=${clienteId}&empleadoId=${empleadoId}`, {
		method: 'PATCH'
	})
		.then(res => {
			if (!res.ok) throw new Error('Error asignando cliente');
			return res.text();
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			console.error('Error al asignar cliente:', err);
			mostrarPopupConfirmacion('Error', 'No se pudo asignar el cliente, puede que se esté duplicando');
		});

}

document.addEventListener('DOMContentLoaded', function() {
	const mesaContainer = document.getElementById('mesas-container');

	fetch('/mesalista/api/mesa/todas')
		.then(response => response.json())
		.then(mesas => {
			mesas.forEach(mesa => {
				const mesaDiv = document.createElement('div');
				mesaDiv.className = 'mesa ' + getEstadoClass(mesa.estado);
				mesaDiv.dataset.id = mesa.id;
				mesaDiv.dataset.estado = mesa.estado;
				mesaDiv.dataset.cliente = mesa.cliente ? mesa.cliente.id : '';

				const mesaNombre = document.createElement('span');
				mesaNombre.className = 'mesa-nombre';
				mesaNombre.textContent = mesa.nombre;
				mesaDiv.appendChild(mesaNombre);

				if (mesa.estado === 2 && mesa.cliente) {
					const clienteSpan = document.createElement('span');
					clienteSpan.className = 'mesa-cliente';
					clienteSpan.textContent = mesa.cliente.nombre;
					mesaDiv.appendChild(clienteSpan);
				}

				mesaContainer.appendChild(mesaDiv);

				mesaDiv.addEventListener('click', () => {
					if (mesa.estado === 2 && mesa.pedido) {
						mostrarDetalleModal(mesa);
					}
				});

				mesaDiv.addEventListener('contextmenu', function(e) {
					e.preventDefault();
					showEstadoMenu({
						x: e.clientX,
						y: e.clientY,
						currentEstado: mesa.estado,
						mesaId: mesa.id,
						updateEstadoCallback: desalojarMesa,
						asignarClienteCallback: showClienteSearchModal
					});
				});
			});
		})
		.catch(error => {
			console.error('Error fetching mesas:', error);
			mostrarPopupConfirmacion('Error', 'Error cargando mesas');
		});

	document.getElementById('modal-close').addEventListener('click', () => {
		document.getElementById('pedido-modal').style.display = 'none';
	});
});


function confirmarMovimiento() {
	const mesaDestinoId = document.getElementById('select-mesa-destino').value;
	enviarMovimientoCliente(mesaDestinoId);
	cerrarModalMoverCliente();
}

function enviarMovimientoCliente(mesaDestinoId) {
	if (!clienteAMoverId || !mesaOrigenAMoverId) {
		mostrarPopupConfirmacion('Error', 'Faltan datos para mover al cliente.');
		return;
	}

	const body = {
		mesaOrigenId: parseInt(mesaOrigenAMoverId),
		clienteId: parseInt(clienteAMoverId),
		mesaDestinoId: parseInt(mesaDestinoId)
	};

	fetch('/mesalista/api/mesa/movercliente', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
		.then(res => {
			if (!res.ok) throw new Error('No se pudo mover el cliente.');
			return res.text();
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			mostrarPopupConfirmacion('Error', 'Error al intentar mover al cliente: ' + err.message);
		});
}

function cerrarModalMoverCliente() {
	document.getElementById('modal-mover-cliente').style.display = 'none';
}

let clienteAMoverId = null;
let mesaOrigenAMoverId = null;

function moverCliente(clienteId, mesaOrigenId) {
	clienteAMoverId = clienteId;
	mesaOrigenAMoverId = mesaOrigenId;

	const select = document.getElementById('select-mesa-destino');
	select.innerHTML = '';

	const mesas = document.querySelectorAll('.mesa');

	mesas.forEach(mesa => {
		//console.log(mesa);
		const estado = mesa.getAttribute('data-estado');
		const id = mesa.getAttribute('data-id');
		const nombre = mesa.querySelector('.mesa-nombre')?.innerText.trim() || `Mesa ${id}`;

		if (estado === '1') {
			const option = document.createElement('option');
			option.value = id;
			option.textContent = nombre;
			select.appendChild(option);
		}
	});

	document.getElementById('modal-mover-cliente').style.display = 'block';
}


function desalojarMesa(mesaId) {
	fetch(`/mesalista/api/mesa/desalojar/${mesaId}`, {
		method: 'PATCH'
	})
		.then(res => {
			if (!res.ok) throw new Error('No se pudo desalojar esta mesa');
			return res.text(); // o .json() si decides retornar algo útil
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			//console.error('Error al desalojar la mesa:', err);
			mostrarPopupConfirmacion('Error', 'Error al intentar desalojar la mesa: ' + err);
		});
}


function cerrarMesa(mesaId) {
	fetch(`/mesalista/api/mesa/cerrar/${mesaId}`, {
		method: 'PATCH'
	})
		.then(res => {
			if (!res.ok) throw new Error('No se pudo cerrar esta mesa');
			return res.text(); // o .json() si decides retornar algo útil
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			//console.error('Error al cerrar la mesa:', err);
			mostrarPopupConfirmacion('Error', 'Error al intentar cerrar la mesa: ' + err);
		});
}

function aperturarMesa(mesaId) {
	fetch(`/mesalista/api/mesa/aperturar/${mesaId}`, {
		method: 'PATCH'
	})
		.then(res => {
			if (!res.ok) throw new Error('No se pudo aperturar esta mesa');
			return res.text(); // o .json() si decides retornar algo útil
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			//console.error('Error al aperturar la mesa:', err);
			mostrarPopupConfirmacion('Error', 'Error al intentar aperturar la mesa: ' + err);
		});
}

function eliminarMesa(mesaId) {
	mostrarPopupConfirmacion('Question', '¿Deseas eliminar esa mesa?', () => {
		fetch(`/mesalista/api/mesa/eliminar/${mesaId}`, {
			method: 'DELETE'
		})
			.then(res => {
				if (!res.ok) throw new Error('No se pudo eliminar esta mesa');
				return res.text();
			})
			.then(() => {
				mostrarPopupConfirmacion('Success', 'Mesa borrada correctamente!', () => {
					location.reload();
				});
			})
			.catch(err => {
				mostrarPopupConfirmacion('Error', 'Error al intentar eliminar la mesa: ' + err);
			});
	},
		() => {
			// Cancelado por el usuario, no hacer nada
		}
	);
}


function getEstadoClass(estado) {
	switch (estado) {
		case 0: return 'desuso';
		case 1: return 'disponible';
		case 2: return 'ocupada';
		default: return '';
	}
}

// Cierra el menú contextual al hacer clic fuera de él
document.addEventListener('click', function(event) {
	const menu = document.getElementById('estado-context-menu');
	if (menu && menu.style.display === 'block') {
		// Si el clic no fue dentro del menú, lo ocultamos
		if (!menu.contains(event.target)) {
			menu.style.display = 'none';
		}
	}
});

// Cierra el menú contextual al presionar Escape
document.addEventListener('keydown', function(event) {
	const menu = document.getElementById('estado-context-menu');
	if (event.key === 'Escape' && menu && menu.style.display === 'block') {
		menu.style.display = 'none';
	}
});

document.getElementById('cliente-modal-close').addEventListener('click', () => {
	document.getElementById('cliente-modal').style.display = 'none';
});


document.addEventListener('keydown', function(e) {
	if (e.key === 'Escape') {
		document.getElementById('cliente-modal').style.display = 'none';
	}
});

// Escucha "Enter" en cualquiera de los dos campos
['empleado-id-input', 'empleado-clave-input'].forEach(id => {
	document.getElementById(id).addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			document.getElementById('verificar-empleado-btn').click();
		}
	});
});

document.getElementById('verificar-empleado-btn').addEventListener('click', () => {
	const empleadoId = document.getElementById('empleado-id-input').value.trim();
	const clave = document.getElementById('empleado-clave-input').value.trim();

	if (!empleadoId || !clave) {
		mostrarPopupConfirmacion('Warning', 'Por favor, completa ambos campos.');
		return;
	}

	const empleadoIdNum = parseInt(empleadoId);
	if (isNaN(empleadoIdNum)) {
		mostrarPopupConfirmacion('Warning', 'El ID de empleado debe ser un número válido.');
		return;
	}

	fetch('/mesalista/api/empleado/validar-mesero', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: empleadoIdNum, clave: clave })
	})
		.then(res => {
			if (!res.ok) throw new Error('Error de autenticación');
			return res.json();
		})
		.then(data => {
			if (!data.p_es_valido) {
				mostrarPopupConfirmacion('Error', data.p_mensaje || 'Credenciales inválidas');
				return;
			}

			asignarClienteConfirmado(mesaSeleccionadaId, clienteSeleccionadoId, empleadoIdNum, clave);

			// Cierra y limpia
			document.getElementById('verificacion-empleado-modal').style.display = 'none';
			document.getElementById('empleado-id-input').value = '';
			document.getElementById('empleado-clave-input').value = '';
		})
		.catch(err => {
			console.error('Error validando empleado:', err);
			mostrarPopupConfirmacion('Error', 'Fallo en la autenticación');
		});
});

function asignarClienteConfirmado(mesaId, clienteId, empleadoId, claveEmpleado) {
	fetch('/mesalista/api/mesa/asignar', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			mesaId: mesaId,
			clienteId: clienteId,
			empleadoId: empleadoId,
			claveEmpleado: claveEmpleado
		})
	})
		.then(res => {
			if (!res.ok) throw new Error('Error asignando cliente');
			return res.text();
		})
		.then(() => {
			location.reload();
		})
		.catch(err => {
			console.error('Error asignando cliente:', err);
			mostrarPopupConfirmacion('Error', 'No se pudo asignar el cliente, puede que se esté duplicando');
		});
}

// Crear mesas
// Mostrar el modal al hacer clic en el botón
document.getElementById('agregar-mesa-btn').addEventListener('click', function() {
	document.getElementById('crearMesaModal').style.display = 'block';
});

// Cerrar el modal
document.getElementById('cerrarCrearMesa').addEventListener('click', () => {
	document.getElementById('crearMesaModal').style.display = 'none';
});

document.getElementById('formCrearMesa').addEventListener('submit', function(e) {
	e.preventDefault();

	const nombre = document.getElementById('nombreMesa').value.trim();

	if (!nombre) {
		mostrarPopupConfirmacion('Warning', 'El nombre de la mesa es obligatorio');
		return;
	}

	mostrarPopupConfirmacion(
		'Question',
		'¿Deseas crear esa mesa?',
		() => {
			fetch('/mesalista/api/mesa/crear', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ nombre: nombre })
			})
				.then(res => {
					if (!res.ok) throw new Error('Error al crear mesa, puede que se esté duplicando');
					return res.json();
				})
				.then(nuevaMesa => {
					mostrarPopupConfirmacion('Success', 'Mesa creada correctamente', () => {
						document.getElementById('crearMesaModal').style.display = 'none';
						location.reload();
					});
				})
				.catch(err => {
					console.error('Error:', err);
					mostrarPopupConfirmacion('Error', 'Error al crear mesa, puede que se esté duplicando');
				});
		}
	);
});

document.getElementById('verificacion-empleado-close').addEventListener('click', () => {
	document.getElementById('verificacion-empleado-modal').style.display = 'none';
});

document.addEventListener('keydown', function(e) {
	if (e.key === 'Escape') {
		document.getElementById('verificacion-empleado-modal').style.display = 'none';
	}
});

