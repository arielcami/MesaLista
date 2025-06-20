// Función principal que inicia la exportación del SQL
async function iniciarExportacionBackup() {
	// console.log("Iniciando exportación de base de datos...");

	try {
		// Descargar el SQL
		const response = await fetch('/mesalista/api/reportes-backup-db/exportar');
		if (!response.ok) throw new Error("Fallo en la descarga del backup SQL");

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;

		let filename = "backup_mesalista.sql";
		const disposition = response.headers.get('Content-Disposition');
		if (disposition && disposition.includes("filename=")) {
			const match = disposition.match(/filename="?(.+?)"?$/);
			if (match) filename = match[1];
		}

		link.download = filename;
		link.click();
		window.URL.revokeObjectURL(url);

		// console.log("Backup SQL descargado:", filename);

		// Confirmar si desea exportar CSV
		mostrarPopupConfirmacion(
			"Question",
			"¿Deseas también exportar las tablas como archivos CSV?",
			async () => await exportarCSVYConfirmarLimpieza(),
			() => {
				// console.log("Exportación CSV cancelada.");
				preguntarLimpiezaBD();
			}
		);

	} catch (err) {
		console.error("Error al exportar backup:", err);
		mostrarPopupConfirmacion("Error", "Hubo un error al exportar el backup.");
	}
}

// ✅ Exportar CSV
async function exportarCSVYConfirmarLimpieza() {
	try {
		const csvResponse = await fetch('/mesalista/api/reportes-backup-db/exportar-csv');

		if (csvResponse.ok) {
			const csvBlob = await csvResponse.blob();
			const csvUrl = window.URL.createObjectURL(csvBlob);
			const csvLink = document.createElement('a');
			csvLink.href = csvUrl;

			let csvFilename = "backup_csv.zip";
			const csvDisposition = csvResponse.headers.get('Content-Disposition');
			if (csvDisposition && csvDisposition.includes("filename=")) {
				const match = csvDisposition.match(/filename="?(.+?)"?$/);
				if (match) csvFilename = match[1];
			}

			csvLink.download = csvFilename;
			csvLink.click();
			window.URL.revokeObjectURL(csvUrl);

			// console.log("CSV descargado:", csvFilename);
		} else {
			mostrarPopupConfirmacion("Error", "No se pudo descargar el archivo CSV.");
		}

	} catch (err) {
		console.error("❌ Error al exportar CSV:", err);
		mostrarPopupConfirmacion("Error", "Hubo un error al exportar el CSV.");
	}

	// Después del CSV, preguntar limpieza
	preguntarLimpiezaBD();
}

// Confirmación para limpiar BD
function preguntarLimpiezaBD() {
	mostrarPopupConfirmacion(
		"Warning",
		"¿Deseas limpiar la base de datos después del backup?",
		async () => {
			// console.log("Solicitando limpieza de base de datos...");
			const limpiarResponse = await fetch('/mesalista/api/reportes-backup-db/limpiar');
			if (limpiarResponse.ok) {
				const mensaje = await limpiarResponse.text();
				mostrarPopupConfirmacion("Success", "Limpieza completada: " + mensaje);
			} else {
				mostrarPopupConfirmacion("Error", "Error al limpiar base de datos.");
			}
		}
	);
}

// Al hacer clic en el botón principal, iniciar todo con confirmación
document.getElementById('btn-backup-db').addEventListener('click', () => {
	// console.log("Solicitando confirmación inicial para backup...");

	mostrarPopupConfirmacion(
		"Question",
		"¿Deseas realizar un backup de la base de datos?",
		() => iniciarExportacionBackup(),
		() => console.log("Backup cancelado por el usuario.")
	);
});
