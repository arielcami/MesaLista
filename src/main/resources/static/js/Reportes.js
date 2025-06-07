const estados = {
	0: 'Inactivo',
	1: 'En preparación',
	2: 'Listo',
	3: 'En tránsito',
	4: 'Entregado',
	5: 'No entregado',
	6: 'Incidente',
	7: 'Devuelto',
	8: 'ERROR'
};

const coloresPorEstado = {
	0: "rgba(160, 160, 160, 0.7)",
	1: "rgba(255, 200, 100, 0.7)",
	2: "rgba(100, 180, 255, 0.7)",
	3: "rgba(180, 130, 255, 0.7)",
	4: "rgba(0, 200, 100, 0.7)",
	5: "rgba(235, 40, 40, 0.7)",
	6: "rgba(120, 72, 32, 0.7)",
	7: "rgba(255, 160, 0, 0.7)",
	8: "rgba(255, 0, 0, 0.7)"
};

document.addEventListener("DOMContentLoaded", () => {
	const modal = document.getElementById("auth-modal-unico");
	const btnLogin = document.getElementById("btn-auth-login");
	const btnBack = document.getElementById("btn-auth-regresar");
	const inputId = document.getElementById("auth-id");
	const inputClave = document.getElementById("auth-clave");
	const errorMsg = document.getElementById("auth-error");
	const contenidoReportes = document.getElementById("contenido-reportes");

	// Crear contenedor para gráficos y selector de reportes
	const reportesContainer = document.createElement("div");
	reportesContainer.id = "reportes-container";
	contenidoReportes.appendChild(reportesContainer);

	const dropdown = document.createElement("select");
	dropdown.id = "reportes-dropdown";
	dropdown.style.marginBottom = "20px";
	contenidoReportes.insertBefore(dropdown, reportesContainer);

	// Lista de reportes con endpoints y títulos
	const reportes = [
		{ id: "ventasDia", label: "Ventas totales por día", url: "/mesalista/api/reportes/ventas-por-dia" },
		{ id: "ventasMes", label: "Ventas totales por mes", url: "/mesalista/api/reportes/ventas-por-mes" },
		{ id: "productosVendidos", label: "Productos más vendidos", url: "/mesalista/api/reportes/productos-mas-vendidos" },
		{ id: "ticketPromedioPorDia", label: "Ticket promedio por día", url: "/mesalista/api/reportes/ticket-promedio-por-dia" },
		{ id: "clientesFrecuentes", label: "Clientes más frecuentes", url: "/mesalista/api/reportes/clientes-frecuentes" },
		{ id: "ventasEmpleado", label: "Ventas por empleado", url: "/mesalista/api/reportes/ventas-por-empleado" },
		{ id: "entregasDelivery", label: "Entregas por delivery", url: "/mesalista/api/reportes/entregas-por-delivery" },
		{ id: "pedidosEstado", label: "Pedidos por estado", url: "/mesalista/api/reportes/pedidos-por-estado" }
	];

	// Agregar opciones al dropdown
	reportes.forEach(rep => {
		const option = document.createElement("option");
		option.value = rep.id;
		option.textContent = rep.label;
		dropdown.appendChild(option);
	});

	// Librería Chart.js importada dinámicamente
	const loadChartJs = () => {
		return new Promise((resolve, reject) => {
			if (window.Chart) {
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/npm/chart.js";
			script.onload = () => resolve();
			script.onerror = () => reject(new Error("No se pudo cargar Chart.js"));
			document.head.appendChild(script);
		});
	};

	// Función para crear canvas para cada gráfico
	const crearCanvas = (id) => {
		const contenedor = document.getElementById("reportes-container");
		contenedor.innerHTML = "";
		const canvas = document.createElement("canvas");
		canvas.id = id;
		canvas.width = 800;
		canvas.height = 400;
		contenedor.appendChild(canvas);
		return canvas;
	};

	// Funciones para procesar datos y dibujar gráficos
	const dibujarVentasPorDia = (data) => {
		// Asegurar que estén ordenados por fecha ascendente
		const dataOrdenada = data.slice().sort((a, b) => new Date(a[0]) - new Date(b[0]));

		// Obtener solo los últimos 30 días
		const ultimos30 = dataOrdenada.slice(-30);

		const labels = ultimos30.map(d => d[0]); // fecha
		const ventas = ultimos30.map(d => d[1]);

		const ctx = crearCanvas("ventasDia").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					label: "Ventas Totales",
					data: ventas,
					backgroundColor: "rgba(54, 162, 235, 0.7)",
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } },
				responsive: true,
			}
		});
	};


	// Ventas por mes (1 año)
	const dibujarVentasPorMes = (data) => {
		if (!data || data.length === 0) return;

		const convertirMesLegible = (codigo) => {
			const [anio, mes] = codigo.split("-");
			const meses = [
				"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
				"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
			];
			return `${meses[parseInt(mes, 10) - 1]} ${anio}`;
		};

		const anioActual = new Date().getFullYear();

		// Filtrar solo los datos del año actual
		const dataFiltrada = data.filter(d => {
			const [anio] = d[0].split("-");
			return parseInt(anio, 10) === anioActual;
		});

		// Ordenar por mes (por si viene desordenado del backend)
		const dataOrdenada = dataFiltrada.slice().sort((a, b) => {
			const [, mesA] = a[0].split("-");
			const [, mesB] = b[0].split("-");
			return parseInt(mesA, 10) - parseInt(mesB, 10);
		});

		const labels = dataOrdenada.map(d => convertirMesLegible(d[0]));
		const ventas = dataOrdenada.map(d => d[1]);

		const ctx = crearCanvas("ventasPorMes").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					label: "Ventas Totales por Mes",
					data: ventas,
					backgroundColor: "rgba(153, 102, 255, 0.7)"
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				},
				responsive: true,
			}
		});
	};


	const dibujarProductosMasVendidos = (data) => {
		const labels = data.map(d => d[0]);
		const cantidades = data.map(d => d[1]);

		const ctx = crearCanvas("productosVendidos").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					label: "Cantidad Vendida",
					data: cantidades,
					backgroundColor: "rgba(255, 159, 64, 0.7)",
				}]
			},
			options: {
				indexAxis: 'y',
				scales: {
					x: { beginAtZero: true }
				},
				responsive: true,
			}
		});
	};


	const dibujarTicketPromedioPorDia = (data) => {
		// Obtener la fecha límite: hoy - 30 días
		const hoy = new Date();
		const hace30dias = new Date();
		hace30dias.setDate(hoy.getDate() - 30);

		// Filtrar datos de los últimos 30 días
		const dataFiltrada = data.filter(d => {
			const fecha = new Date(d[0]);
			return fecha >= hace30dias && fecha <= hoy;
		});

		// Asegurar que estén en orden cronológico
		const dataOrdenada = dataFiltrada.slice().sort((a, b) => new Date(a[0]) - new Date(b[0]));

		const labels = dataOrdenada.map(d => d[0]);  // fechas
		const tickets = dataOrdenada.map(d => d[1]); // ticket promedio

		const ctx = crearCanvas("ticketPromedioPorDia").getContext("2d");
		new Chart(ctx, {
			type: "line",
			data: {
				labels,
				datasets: [{
					label: "Ticket Promedio",
					data: tickets,
					borderColor: "rgba(255, 206, 86, 1)",
					backgroundColor: "rgba(255, 206, 86, 0.5)",
					fill: true,
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } },
				responsive: true,
			}
		});
	};


	const dibujarClientesFrecuentes = (data) => {
		// Ordenar por cantidad de compras (índice 1) de mayor a menor
		const topClientes = data
			.slice() // copia del array original para no mutarlo
			.sort((a, b) => b[1] - a[1])
			.slice(0, 15); // tomar los 15 primeros

		const labels = topClientes.map(d => d[0]); // nombre cliente
		const compras = topClientes.map(d => d[1]);
		const gastado = topClientes.map(d => d[2]);

		const ctx = crearCanvas("clientesFrecuentes").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [
					{
						label: "Cantidad de Compras",
						data: compras,
						backgroundColor: "rgba(255, 99, 132, 0.7)",
					},
					{
						label: "Total Gastado",
						data: gastado,
						backgroundColor: "rgba(54, 162, 235, 0.7)",
					}
				]
			},
			options: {
				scales: { y: { beginAtZero: true } },
				responsive: true,
			}
		});
	};


	const dibujarVentasPorEmpleado = (data) => {
		const labels = data.map(d => d[0]); // nombre empleado
		const ventas = data.map(d => d[1]);

		const ctx = crearCanvas("ventasEmpleado").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					label: "Ventas Totales",
					data: ventas,
					backgroundColor: "rgba(75, 192, 192, 0.7)",
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } },
				responsive: true,
			}
		});
	};

	const dibujarEntregasPorDelivery = (data) => {
		const labels = data.map(d => d[0]); // nombre del delivery
		const entregas = data.map(d => d[1]);

		const ctx = crearCanvas("entregasDelivery").getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					label: "Cantidad de Entregas",
					data: entregas,
					backgroundColor: "rgba(255, 159, 64, 0.7)",
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } },
				responsive: true,
			}
		});
	};

	// Pedidos por estado
	const dibujarPedidosPorEstado = (data) => {
		const labels = data.map(d => estados[d[0]] || `Desconocido (${d[0]})`);
		const cantidades = data.map(d => d[1]);
		const backgroundColors = data.map(d => coloresPorEstado[d[0]] || "rgba(100, 100, 100, 0.7)");

		const ctx = crearCanvas("pedidosPorEstado").getContext("2d");

		new Chart(ctx, {
			type: "doughnut",
			data: {
				labels,
				datasets: [{
					label: "Cantidad de Pedidos",
					data: cantidades,
					backgroundColor: backgroundColors
				}]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'right'
					},
					title: {
						display: true,
						text: 'Pedidos por estado',
						font: {
							size: 20
						}
					}
				}
			}
		});
	};

	// Carga y muestra un reporte según el id
	const cargarReporte = async (id) => {
		const reporte = reportes.find(r => r.id === id);
		if (!reporte) return;

		try {
			const res = await fetch(reporte.url);
			const data = await res.json();

			switch (id) {
				case "ventasDia": dibujarVentasPorDia(data); break;
				case "ventasMes": dibujarVentasPorMes(data); break;
				case "productosVendidos": dibujarProductosMasVendidos(data); break;
				case "clientesFrecuentes": dibujarClientesFrecuentes(data); break;
				case "ventasEmpleado": dibujarVentasPorEmpleado(data); break;
				case "ticketPromedioPorDia": dibujarTicketPromedioPorDia(data); break;
				case "entregasDelivery": dibujarEntregasPorDelivery(data); break;
				case "pedidosEstado": dibujarPedidosPorEstado(data); break;
				default:
					reportesContainer.innerHTML = "<p>No hay reporte para mostrar.</p>";
			}

		} catch (error) {
			console.error("Error cargando reporte:", error);
			reportesContainer.innerHTML = "<p>Error cargando reporte.</p>";
		}
	};

	// Función para validar el acceso
	const validarAcceso = () => {
		const idEmpleado = parseInt(inputId.value);
		const clave = inputClave.value;

		if (!idEmpleado || !clave) {
			errorMsg.textContent = "Debe ingresar ambos campos";
			errorMsg.style.display = "block";
			return;
		}

		fetch(`/mesalista/api/reportes/acceso?idEmpleado=${idEmpleado}&clave=${encodeURIComponent(clave)}`)
			.then(res => res.json())
			.then(data => {
				if (data.p_es_valido) {
					localStorage.setItem("idEmpleado", idEmpleado);
					modal.style.display = "none";
					contenidoReportes.style.display = "block";

					// Cargar reporte principal inicial
					loadChartJs()
						.then(() => cargarReporte("ventasDia"))
						.catch(err => {
							console.error(err);
							reportesContainer.innerHTML = "<p>Error cargando gráficos.</p>";
						});
				} else {
					errorMsg.textContent = data.p_mensaje || "Acceso denegado";
					errorMsg.style.display = "block";
				}
			})
			.catch(err => {
				console.error("Error:", err);
				errorMsg.textContent = "Error de conexión con el servidor";
				errorMsg.style.display = "block";
			});
	};

	// Evento click login
	btnLogin.addEventListener("click", validarAcceso);

	// Enter en modal para validar
	modal.addEventListener("keydown", (event) => {
		if (event.key === "Enter") validarAcceso();
	});

	// Botón regresar
	btnBack.addEventListener("click", () => {
		history.back();
	});

	// Evento cambio en dropdown para cargar otros reportes
	dropdown.addEventListener("change", () => {
		loadChartJs()
			.then(() => cargarReporte(dropdown.value))
			.catch(err => {
				console.error(err);
				reportesContainer.innerHTML = "<p>Error cargando gráficos.</p>";
			});
	});
});
