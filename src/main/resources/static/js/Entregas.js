// ============================
// VARIABLES GLOBALES
// ============================
let pedidosSeleccionados = new Set();


// ============================
// FUNCIONES AUXILIARES
// ============================

function formatearHoraAMPM(fechaStr) {
	const fecha = new Date(fechaStr);
	return fecha.toLocaleTimeString('es-PE', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
}

function formatearTelefono(numero) {
	const limpio = numero.replace(/\D/g, '');
	if (limpio.length !== 9) return numero;
	return `${limpio.slice(0, 3)}-${limpio.slice(3, 6)}-${limpio.slice(6)}`;
}

function estadoPedidoTexto(codigo) {
	const estados = {
		0: 'Inactivo',
		1: 'En preparación',
		2: 'Disponible',
		3: 'En tránsito',
		4: 'Entregado',
		5: 'No entregado',
		6: 'Incidente',
		7: 'Devuelto',
		8: 'ERROR'
	};
	return estados[codigo] || 'Desconocido';
}

// ============================
// ACTUALIZAR BOTÓN DE ENTREGA
// ============================

function actualizarBotonEntrega() {
	let boton = document.getElementById('btn-empezar-entrega');
	

	if (pedidosSeleccionados.size > 0) {
		
		
		
		if (!boton) {
			boton = document.createElement('button');
			boton.id = 'btn-empezar-entrega';
			boton.textContent = 'Empezar entrega';
			boton.className = 'btn-entrega-confirmar';

			boton.addEventListener('click', async () => {
				const ids = Array.from(pedidosSeleccionados);
				const deliveryId = localStorage.getItem('id_de_empleado_delivery');

				if (!deliveryId) {
					alert('Error: Delivery no autenticado');
					return;
				}

				try {
					for (const id of ids) {
						await fetch(`/mesalista/api/pedido/marcarEstado/${id}?estado=3`, { method: 'PUT' });
						await fetch(`/mesalista/api/pedido/${id}/set-delivery/${deliveryId}`, { method: 'PUT' });
					}

					alert('Pedidos marcados como En tránsito correctamente');
					pedidosSeleccionados.clear();
					actualizarBotonEntrega();
					cargarPedidosPorEstado(3);

				} catch (err) {
					console.error(err);
					alert('Ocurrió un error al iniciar la entrega de los pedidos.');
				}
			});

			document.body.appendChild(boton);
		}
		boton.style.display = 'block';

	} else {
		if (boton) {
			boton.style.display = 'none';

		}
	}
}

// ============================
// RENDERIZAR PEDIDOS
// ============================

function renderizarTarjetasPedido(pedidos) {
	const contenedor = document.getElementById('bloque-pedidos-entrega');
	contenedor.innerHTML = '';

	pedidos.forEach(pedido => {
				
		const tarjeta = document.createElement('div');
		tarjeta.className = 'entregas-pedido-tarjeta';

		tarjeta.innerHTML = `
		    <div class="lado-izquierdo">
		      <h3 class="entregas-pedido-id">Pedido #${pedido.id} - ${estadoPedidoTexto(pedido.estadoPedido)}</h3>
		      <p class="entregas-pedido-cliente"><strong>Cliente:</strong> ${pedido.cliente?.nombre ?? 'N/D'}</p>
		      <p class="entregas-pedido-telefono"><strong>Teléfono:</strong> ${formatearTelefono(pedido.cliente?.telefono ?? '')}</p>
		      <p class="entregas-pedido-direccion"><strong>Dirección:</strong> ${pedido.direccionEntrega}</p>
		      <p class="entregas-pedido-hora"><strong>Hora del pedido:</strong> ${formatearHoraAMPM(pedido.fechaPedido)}</p>
		      <p class="entregas-pedido-empleado"><strong>Atendido por:</strong> ${pedido.empleado?.nombre ?? 'N/D'}</p>
		    </div>
		    <div class="lado-derecho">
		      <a href="#" class="btn-ver-ruta" data-direccion="${encodeURIComponent(pedido.direccionEntrega)}">Ver rutas</a>
		      <a href="#" class="btn-ver-detalle" data-pedido-id="${pedido.id}">Ver detalle</a>
		    </div>
		`;

		// Acciones: ver ruta
		const botonRuta = tarjeta.querySelector('.btn-ver-ruta');
		botonRuta.addEventListener('click', function (e) {
			e.stopPropagation();
			e.preventDefault();
			const direccion = this.dataset.direccion;
			window.open(`https://www.google.com/maps/search/?api=1&query=${direccion}`, '_blank');
		});

		// Acciones: ver detalle
		const botonDetalle = tarjeta.querySelector('.btn-ver-detalle');
		botonDetalle.addEventListener('click', function (e) {
			e.stopPropagation();
			e.preventDefault();
			const idPedido = this.dataset.pedidoId;
			if (window.abrirModalDetallePedido) {
				window.abrirModalDetallePedido(idPedido);
			} else {
				alert('Función para mostrar detalle no disponible.');
			}
		});

		// Selección de pedidos si están en estado 2
		if (pedido.estadoPedido === 2) {
			
			tarjeta.addEventListener('click', () => {
								
				if (pedidosSeleccionados.has(pedido.id)) {
					pedidosSeleccionados.delete(pedido.id);
					tarjeta.classList.remove('seleccionado');
				} else {
					pedidosSeleccionados.add(pedido.id);
					tarjeta.classList.add('seleccionado');
				}
				actualizarBotonEntrega();
			});
		}

		contenedor.appendChild(tarjeta);
	});
}



// ============================
// CARGA DE PEDIDOS POR ESTADO
// ============================

async function cargarPedidosPorEstado(estado) {
	try {
		const response = await fetch(`/mesalista/api/pedido/estado/${estado}`);
		if (!response.ok) throw new Error('Error al cargar pedidos');
		const pedidos = await response.json();
		renderizarTarjetasPedido(pedidos);
	} catch (error) {
		console.error(error);
		alert('Error al obtener los pedidos');
	}
}

async function cargarPedidosDisponibles() {
	await cargarPedidosPorEstado(2);
}


// ============================
// AUTENTICACIÓN DE DELIVERY
// ============================

function autenticarEmpleado() {
	const id = document.getElementById("delivery-id").value.trim();
	const clave = document.getElementById("delivery-clave").value.trim();
	const errorMsg = document.getElementById("delivery-auth-error");

	if (!id || !clave) {
		errorMsg.textContent = "Por favor, complete ambos campos";
		errorMsg.style.display = "block";
		return;
	}

	fetch("/mesalista/api/empleado/validar-delivery", {
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
				localStorage.setItem('id_de_empleado_delivery', id);
				document.getElementById("delivery-auth-modal").style.display = "none";
				errorMsg.style.display = "none";
				cargarPedidosDisponibles();
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


// ============================
// INICIALIZACIÓN DOM
// ============================

document.addEventListener("DOMContentLoaded", () => {
	const deliveryID = localStorage.getItem('id_de_empleado_delivery');
	const modal = document.getElementById("delivery-auth-modal");

	if (deliveryID) {
		modal.style.display = "none";
		cargarPedidosDisponibles();
	} else {
		modal.style.display = "block";
	}

	document.getElementById("btn-delivery-login").addEventListener("click", autenticarEmpleado);

	const btnListar = document.getElementById("btn-listar-pedidos");
	if (btnListar) {
		btnListar.addEventListener("click", e => {
			e.preventDefault();
			cargarPedidosDisponibles();
		});
	}

	const btnTransito = document.getElementById("btn-pedidos-transito");
	if (btnTransito) {
		btnTransito.addEventListener("click", e => {
			e.preventDefault();
			cargarPedidosPorEstado(3);
		});
	}
});


// ============================
// LOGOUT
// ============================

const btnLogout = document.getElementById("btn-logout-delivery");
if (btnLogout) {
	btnLogout.addEventListener("click", e => {
		e.preventDefault();
		localStorage.clear();
		window.location.href = "/mesalista/entregas";
	});
}
