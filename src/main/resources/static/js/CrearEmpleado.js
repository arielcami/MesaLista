document.addEventListener("DOMContentLoaded", () => {
	const btnNuevoEmpleado = document.getElementById("btn-nuevo-empleado");
	const popupOverlay = document.getElementById("create-employee-popup");
	const form = document.getElementById("create-employee-form");
	const closeBtn = document.getElementById("create-employee-close");

	if (!btnNuevoEmpleado || !popupOverlay || !form || !closeBtn) return;

	// Mostrar el modal para crear nuevo empleado
	btnNuevoEmpleado.addEventListener("click", () => {
		form.reset(); // Limpia campos
		popupOverlay.style.display = "flex";
	});

	// Cerrar modal al hacer clic en el botón cerrar
	closeBtn.addEventListener("click", () => {
		popupOverlay.style.display = "none";
	});

	// Enviar formulario para crear empleado nuevo
	form.addEventListener("submit", (e) => {
		e.preventDefault();

		const nuevoEmpleado = {
			nombre: document.getElementById("create-nombre").value.trim(),
			documento: document.getElementById("create-documento").value.trim(),
			telefono: document.getElementById("create-telefono").value.trim(),
			direccion: document.getElementById("create-direccion").value.trim(),
			clave: document.getElementById("create-clave").value,
			nivel: parseInt(document.getElementById("create-nivel").value),
			estado: true
		};

		fetch("/mesalista/api/empleado", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(nuevoEmpleado)
		})
			.then(res => {
				if (!res.ok) throw new Error("Error al crear empleado");
				return res.json();
			})
			.then(() => {
				popupOverlay.style.display = "none";
				// Refrescar tabla si la función está definida globalmente
				if (typeof window.fetchYRenderEmpleados === "function") {
					window.fetchYRenderEmpleados();
				}
			})
			.catch(err => {
				console.error(err);
				alert("No se pudo crear el empleado.");
			});
	});
});
