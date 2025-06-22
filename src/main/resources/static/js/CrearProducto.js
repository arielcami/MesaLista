// CrearProducto.js

document.addEventListener("DOMContentLoaded", () => {
	const createBtn = document.getElementById('btn-nuevo-producto');
	const createPopupOverlay = document.getElementById('create-popup-overlay');
	const closeBtn = document.getElementById('create-close-btn');
	const createForm = document.getElementById('create-product-form');

	// Abrir popup
	createBtn.addEventListener("click", () => {
		createPopupOverlay.classList.remove('hidden');
		// console.log("Botón 'Agregar Producto Nuevo' clickeado");
	});

	// Cerrar popup
	closeBtn.addEventListener("click", () => {
		createPopupOverlay.classList.add('hidden');
	});

	// Manejo del formulario de creación de producto
	createForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const nombre = document.getElementById('create-nombre').value;
		const precio = parseFloat(document.getElementById('create-precio').value);
		const tipo = parseInt(document.getElementById('create-tipo').value);
		const imagenInput = document.getElementById('create-imagen');
		const imagenFile = imagenInput.files[0];

		const nuevoProducto = {
			nombre: nombre,
			precio: precio,
			tipoProducto: tipo,
			estado: true
		};

		const formData = new FormData();
		formData.append("producto", new Blob([JSON.stringify(nuevoProducto)], {
			type: "application/json"
		}));

		if (imagenFile) {
			formData.append("imagen", imagenFile);
		}

		fetch(`/mesalista/api/producto`, {
			method: 'POST',
			body: formData
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("Error al crear el producto");
				}
				return response.json();
			})
			.then(productoCreado => {
				createPopupOverlay.classList.add('hidden');
				mostrarPopupConfirmacion("success", "Producto creado exitosamente: " + productoCreado.nombre, () => {
					window.location.reload();
				});
			})
			.catch(err => {
				createPopupOverlay.classList.add('hidden');
				console.log(err.toString());
				mostrarPopupConfirmacion("error", "No se pudo crear el producto. Verifica los datos.");
			});
	});

});
