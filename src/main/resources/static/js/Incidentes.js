const campos = ["deliveryId", "deliveryNombre", "pedidoId", "incidenteId", "estadoBusqueda"];

campos.forEach(id => {
	const input = document.getElementById(id);
	if (input) {
		input.addEventListener("input", () => {
			campos.forEach(otroId => {
				if (otroId !== id) {
					document.getElementById(otroId).value = "";
				}
			});
		});
	}
});

// Formatear fecha ISO a dd/MM/yyyy HH:mm
function formatearFecha(fechaISO) {
	const fecha = new Date(fechaISO);
	const pad = n => n.toString().padStart(2, '0');
	const dia = pad(fecha.getDate());
	const mes = pad(fecha.getMonth() + 1);
	const anio = fecha.getFullYear();
	const horas = pad(fecha.getHours());
	const minutos = pad(fecha.getMinutes());
	return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

function limpiarTabla() {
	const tbody = document.querySelector(".incidentes-lista tbody");
	tbody.innerHTML = "";
}

function mostrarIncidentes(incidentes) {
	const tbody = document.querySelector(".incidentes-lista tbody");
	limpiarTabla();

	if (!incidentes || incidentes.length === 0) {
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.colSpan = 9;
		td.textContent = "No se encontraron incidentes.";
		td.style.textAlign = "center";
		tr.appendChild(td);
		tbody.appendChild(tr);
		return;
	}

	incidentes.forEach(incidente => {
		const tr = document.createElement("tr");

		tr.innerHTML = `
            <td>${incidente.id}</td>
            <td>${incidente.pedidoId}</td>
            <td>${incidente.deliveryId}</td>
            <td>${incidente.nombreDelivery || ""}</td>
            <td>${incidente.ubicacion || ""}</td>
            <td>${incidente.incidente || ""}</td>
            <td>${formatearFecha(incidente.fecha)}</td>
            <td>${estadoTexto(incidente.estado)}</td>
        `;

		const tdAcciones = document.createElement("td");
		tdAcciones.style.textAlign = "center";

		const btnEditar = document.createElement("button");
		btnEditar.textContent = "✏️";
		btnEditar.title = "Editar incidente";
		btnEditar.style.cursor = "pointer";
		btnEditar.style.marginRight = "10px";
		btnEditar.addEventListener("click", () => editarIncidente(incidente.id));

		tdAcciones.appendChild(btnEditar);
		tr.appendChild(tdAcciones);

		tbody.appendChild(tr);
	});
}

// Helper para mostrar texto amigable del estado
function estadoTexto(estado) {
	switch (parseInt(estado, 10)) {
		case 0: return "Inactivo";
		case 1: return "Activo";
		case 2: return "Atendido";
		case 3: return "No procede";
		default: return "Desconocido";
	}
}

// Variable global para almacenar todos los incidentes cargados
let incidentesDatos = [];

function buscarIncidentes() {
	const deliveryId = document.getElementById('deliveryId').value.trim();
	const deliveryNombre = document.getElementById('deliveryNombre').value.trim();
	const pedidoId = document.getElementById('pedidoId').value.trim();
	const incidenteId = document.getElementById('incidenteId').value.trim();
	const estado = document.getElementById('estadoBusqueda').value.trim();

	let url = null;

	if (deliveryId) {
		url = `/mesalista/api/incidente/delivery/${deliveryId}`;
	} else if (deliveryNombre) {
		url = `/mesalista/api/incidente/delivery/nombre/${encodeURIComponent(deliveryNombre)}`;
	} else if (pedidoId) {
		url = `/mesalista/api/incidente/pedido/${pedidoId}`;
	} else if (incidenteId) {
		url = `/mesalista/api/incidente/${incidenteId}`;
	} else if (estado !== "") {
		url = `/mesalista/api/incidente/estado/${estado}`;
	} else {
		mostrarPopupConfirmacion("Warning", "Debes ingresar al menos un campo para buscar.");
		return;
	}

	fetch(url)
		.then(response => {
			if (!response.ok) throw new Error("Error en la búsqueda: " + response.status);
			return response.json();
		})
		.then(data => {
			const incidentes = Array.isArray(data) ? data : [data];
			incidentesDatos = incidentes;
			mostrarIncidentes(incidentes);
		})
		.catch(error => {
			console.error(error);
			mostrarPopupConfirmacion("Error", "No se encontraron resultados o hubo un error.");
			limpiarTabla();
		});
}

function cargarIncidentesNoResueltos() {
	fetch('/mesalista/api/incidente')
		.then(response => {
			if (!response.ok) throw new Error("Error al cargar incidentes no resueltos");
			return response.json();
		})
		.then(data => {
			incidentesDatos = data;
			mostrarIncidentes(data);
		})
		.catch(error => {
			console.error(error);
			mostrarPopupConfirmacion("Error", "No se pudieron cargar los incidentes no resueltos.");
		});
}

function editarIncidente(id) {
	const incidente = incidentesDatos.find(i => i.id === id);
	if (!incidente) {
		mostrarPopupConfirmacion("Error", "Incidente no encontrado.");
		return;
	}

	const modal = document.getElementById('modal-editar');
	modal.style.display = 'flex';

	document.getElementById('incidenteIdEditar').value = incidente.id;
	document.getElementById('estadoSelect').value = incidente.estado;
}

document.getElementById('modal-close').addEventListener('click', () => {
	document.getElementById('modal-editar').style.display = 'none';
});

window.addEventListener('click', (e) => {
	if (e.target.classList.contains('modal-editar-container')) {
		document.getElementById('modal-editar').style.display = 'none';
	}
});

document.getElementById('form-editar').addEventListener('submit', (e) => {
	e.preventDefault();

	const id = document.getElementById("incidenteIdEditar").value;
	const estado = document.getElementById("estadoSelect").value;

	mostrarPopupConfirmacion("Question", "¿Deseas guardar los cambios?", () => {
		fetch(`/mesalista/api/incidente/${id}/estado/${estado}`, {
			method: "PATCH"
		})
			.then(response => {
				if (!response.ok) throw new Error("Error al actualizar el estado");
				document.getElementById("modal-editar").style.display = "none";
				cargarIncidentesNoResueltos();
				mostrarPopupConfirmacion("Success", "El estado del incidente fue actualizado correctamente.");
			})
			.catch(error => {
				console.error(error);
				mostrarPopupConfirmacion("Error", "Hubo un error al actualizar el estado.");
			});
	});
});

document.addEventListener("DOMContentLoaded", () => {
	cargarIncidentesNoResueltos();

	const form = document.getElementById('busqueda-form');
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		buscarIncidentes();
	});
});
