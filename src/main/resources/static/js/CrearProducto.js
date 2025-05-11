// CrearProducto.js

document.addEventListener("DOMContentLoaded", () => {
    const createBtn = document.getElementById('btn-nuevo-producto');
    const createPopupOverlay = document.getElementById('create-popup-overlay');
    const closeBtn = document.getElementById('create-close-btn');
    const createForm = document.getElementById('create-product-form');

    // Abrir popup
    createBtn.addEventListener("click", () => {
        createPopupOverlay.style.display = 'flex';
    });

    // Cerrar popup
    closeBtn.addEventListener("click", () => {
        createPopupOverlay.style.display = 'none';
    });

    // Manejo del formulario de creación de producto
    createForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById('create-nombre').value;
        const precio = parseFloat(document.getElementById('create-precio').value);
        const tipo = parseInt(document.getElementById('create-tipo').value);

        const nuevoProducto = {
            nombre: nombre,
            precio: precio,
            tipoProducto: tipo,
            estado: true // Por defecto, el producto estará activo
        };

        // Enviar la solicitud POST para crear el nuevo producto
        fetch(`/mesalista/api/producto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoProducto)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al crear el producto");
            }
            return response.json();
        })
        .then(productoCreado => {
            alert("Producto creado exitosamente");
            // Cerrar el popup
            createPopupOverlay.style.display = 'none';
            // Recargar la lista de productos (esto es solo un ejemplo, podrías hacer una actualización dinámica)
            window.location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("No se pudo crear el producto.");
        });
    });
});
