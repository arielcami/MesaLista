
function formatearHoraAMPM(fechaStr) {
	const fecha = new Date(fechaStr);
	return fecha.toLocaleTimeString('es-PE', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
}


function formatearTelefono(numero) {
	const limpio = numero.replace(/\D/g, ''); // Elimina caracteres no numéricos
	if (limpio.length !== 9) return numero; // Devuelve como está si no son 9 dígitos
	return `${limpio.slice(0, 3)}-${limpio.slice(3, 6)}-${limpio.slice(6)}`;
}



// Función para cargar y mostrar pedidos con estado 2 (Listo para entregar)
async function cargarPedidosDisponibles() {
	const contenedor = document.getElementById('bloque-pedidos-entrega');
	contenedor.innerHTML = ''; // Limpiar contenido previo

	try {
		const response = await fetch('/mesalista/api/pedido/estado/2');
		if (!response.ok) throw new Error('Error en la respuesta del servidor');
		const pedidos = await response.json();

		if (pedidos.length === 0) {
			contenedor.innerHTML = '<p>No hay pedidos disponibles para entregar.</p>';
			return;
		}

		pedidos.forEach(pedido => {
			const tarjeta = document.createElement('div');
			tarjeta.className = 'entregas-pedido-tarjeta';

			tarjeta.innerHTML = `
		    <div class="lado-izquierdo">
		      <h3 class="entregas-pedido-id">ID Pedido: ${pedido.id}</h3>
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

			// Evento para abrir Google Maps al hacer clic en "Ver rutas"
			const botonRuta = tarjeta.querySelector('.btn-ver-ruta');
			botonRuta.addEventListener('click', function(e) {
				e.stopPropagation();
				e.preventDefault();
				const direccion = this.dataset.direccion;
				const url = `https://www.google.com/maps/search/?api=1&query=${direccion}`;
				window.open(url, '_blank');
			});

			// Evento para "Ver detalle"
			const botonDetalle = tarjeta.querySelector('.btn-ver-detalle');
			botonDetalle.addEventListener('click', function(e) {
				e.stopPropagation();
				e.preventDefault();
				const idPedido = this.dataset.pedidoId;
				if (window.abrirModalDetallePedido) {
					window.abrirModalDetallePedido(idPedido);
				} else {
					alert('Función para mostrar detalle no disponible.');
				}
			});

			// Evento opcional para la tarjeta completa
			tarjeta.addEventListener('click', () => {
				alert(`Pedido seleccionado: ${pedido.id}`);
			});

			contenedor.appendChild(tarjeta);
		});

	} catch (error) {
		contenedor.innerHTML = `<p>Error cargando pedidos: ${error.message}</p>`;
	}
}


// Función para autenticar empleado delivery
function autenticarEmpleado() {
	const id = document.getElementById("delivery-id").value.trim();
	const clave = document.getElementById("delivery-clave").value.trim();
	const errorMsg = document.getElementById("delivery-auth-error");

	/*
	// Si ambos campos están vacíos, usar credenciales hardcodeadas para desarrollo
	if (!id && !clave) {
		id = 4;
		clave = "345678";
	}
	*/

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
				
				// Ocultar modal y limpiar error
				document.getElementById("delivery-auth-modal").style.display = "none";
				errorMsg.style.display = "none";

				// Cargar los pedidos disponibles inmediatamente después del login exitoso
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

// Cuando DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
	const deliveryID = localStorage.getItem('id_de_empleado_delivery');
	const modal = document.getElementById("delivery-auth-modal");

	if (deliveryID) {
		// Ocultar el modal de autenticación
		modal.style.display = "none";
		cargarPedidosDisponibles(); // Cargar directamente los pedidos
	} else {
		// Mostrar el modal si no hay sesión previa
		modal.style.display = "block";
	}

	// Evento para el botón de login
	document.getElementById("btn-delivery-login").addEventListener("click", autenticarEmpleado);

	// Evento para botón "Listar"
	const btnListar = document.getElementById("btn-listar-pedidos");
	if (btnListar) {
		btnListar.addEventListener("click", e => {
			e.preventDefault();
			cargarPedidosDisponibles();
		});
	}
});


/* Cerrar sesion */
const btnLogout = document.getElementById("btn-logout-delivery");
if (btnLogout) {
	btnLogout.addEventListener("click", e => {
		e.preventDefault();
		localStorage.clear();
		window.location.href = "/mesalista/entregas";
	});
}
