document.addEventListener("DOMContentLoaded", () => {
	const contenedor = document.getElementById("contenido-reportes");
	const accionesReportes = document.getElementById("acciones-reportes");
	const btnExportar = document.getElementById("btn-exportar-excel");
	const btnImprimir = document.getElementById("btn-imprimir");

	// Lista de opciones con IDs coherentes con Reportes.js
	const opciones = [
		{ value: "ventasDia", text: "Ventas por día" },
		{ value: "ventasMes", text: "Ventas por mes" },
		{ value: "productosVendidos", text: "Productos más vendidos" },
		{ value: "ticketPromedioPorDia", text: "Ticket promedio por día" },
		{ value: "clientesFrecuentes", text: "Clientes frecuentes" },
		{ value: "ventasEmpleado", text: "Ventas por empleado" },
		{ value: "entregasDelivery", text: "Entregas por delivery" },
		{ value: "pedidosEstado", text: "Pedidos por estado" }
	];

	// Mapeo id -> endpoint slug backend
	const mapIdToEndpoint = {
		ventasDia: "ventas-por-dia",
		ventasMes: "ventas-por-mes",
		productosVendidos: "productos-mas-vendidos",
		ticketPromedioPorDia: "ticket-promedio-por-dia",
		clientesFrecuentes: "clientes-frecuentes",
		ventasEmpleado: "ventas-por-empleado",
		entregasDelivery: "entregas-por-delivery",
		pedidosEstado: "pedidos-por-estado"
	};

	// Crear dropdown solo si no existe
	let reportesDropdown = document.getElementById("reportes-dropdown");
	if (!reportesDropdown) {
		reportesDropdown = document.createElement("select");
		reportesDropdown.id = "reportes-dropdown";

		opciones.forEach(opt => {
			const option = document.createElement("option");
			option.value = opt.value;
			option.textContent = opt.text;
			reportesDropdown.appendChild(option);
		});

		contenedor.insertBefore(reportesDropdown, accionesReportes);
	}

	// Función para exportar Excel
	async function exportarExcel() {
		const reporteId = reportesDropdown.value;
		const endpoint = mapIdToEndpoint[reporteId];

		if (!endpoint) {
			alert(`Reporte desconocido: ${reporteId}`);
			return;
		}

		const url = `/mesalista/api/reportes/${endpoint}/exportar`;
		console.log("Iniciando descarga desde:", url);

		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Error en la descarga: ${response.statusText}`);

			const blob = await response.blob();
			const urlBlob = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = urlBlob;

			// Extraer nombre archivo del header Content-Disposition
			const disposition = response.headers.get("Content-Disposition");
			let nombreArchivo = "reporte.xlsx";
			if (disposition && disposition.includes("filename=")) {
				const matches = /filename="?(.+)"?/.exec(disposition);
				if (matches && matches[1]) nombreArchivo = matches[1];
			}
			a.download = nombreArchivo;

			document.body.appendChild(a);
			a.click();
			a.remove();

			window.URL.revokeObjectURL(urlBlob);
		} catch (error) {
			console.error("Error al exportar Excel:", error);
			alert("No se pudo exportar el reporte Excel. Intente nuevamente.");
		}
	}

	// Preparar Version de impresora
	async function imprimirDatosDesdeBackend() {
		const reporteId = reportesDropdown.value;
		const endpoint = mapIdToEndpoint[reporteId];

		if (!endpoint) {
			alert(`Reporte desconocido: ${reporteId}`);
			return;
		}

		const url = `/mesalista/api/reportes/${endpoint}`;

		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Error al obtener datos: ${response.statusText}`);

			const data = await response.json();

			if (!Array.isArray(data) || data.length === 0) {
				alert("No hay datos para imprimir");
				return;
			}

			const numCols = data[0].length;
			const totales = new Array(numCols).fill(0);

			// Sumar valores numéricos por columna
			data.forEach(row => {
				row.forEach((celda, idx) => {
					const valor = parseFloat(celda);
					if (!isNaN(valor)) {
						totales[idx] += valor;
					}
				});
			});

			// Construir tabla
			let tablaHTML = `<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">`;
			tablaHTML += `<tbody>`;

			data.forEach(row => {
				tablaHTML += `<tr>`;
				row.forEach(celda => {
					tablaHTML += `<td>${celda}</td>`;
				});
				tablaHTML += `</tr>`;
			});

			// Fila de totales
			tablaHTML += `<tr style="font-weight: bold; background-color: #f9f9f9;">`;
			totales.forEach((suma, idx) => {
				// Mostrar "Total:" solo en la primera celda
				if (idx === 0) {
					tablaHTML += `<td>Total:</td>`;
				} else {
					tablaHTML += `<td>${suma.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
				}
			});
			tablaHTML += `</tr>`;

			tablaHTML += `</tbody></table>`;

			const tituloReporte = opciones.find(opt => opt.value === reporteId)?.text || "Reporte para imprimir";

			const ventanaPrint = window.open("", "_blank", "width=900,height=600");
			ventanaPrint.document.write(`
				<html>
				<head>
					<title>${tituloReporte}</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 15px; font-size: 12px; }
						h1 { text-align: center; margin-bottom: 20px; font-size: 16px; }
						table { border-collapse: collapse; width: 100%; font-size: 12px; }
						th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
						tr:last-child { font-weight: bold; background-color: #f9f9f9; }
						@media print {
							body { margin: 0; font-size: 12px; }
							table { page-break-inside: avoid; }
						}
					</style>
				</head>
				<body>
					<h1>${tituloReporte}</h1>
					${tablaHTML}
					<script>
						window.onload = function() {
							window.print();
						};
					</script>
				</body>
				</html>
			`);
			ventanaPrint.document.close();

		} catch (error) {
			console.error("Error al imprimir:", error);
			alert("No se pudo obtener los datos para imprimir. Intente nuevamente.");
		}
	}

	btnExportar.addEventListener("click", exportarExcel);

	btnImprimir.addEventListener("click", imprimirDatosDesdeBackend);

});
