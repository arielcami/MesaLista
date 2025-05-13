function cargarProductosPorTipo(tipo, tituloCategoria = "Productos") {
	
    // Asegúrate de que la URL sea correcta
    const url = `/mesalista/api/producto/tipo/activo/${tipo}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById("modal-productos");
            const contenedor = document.getElementById("contenedor-productos");
            const titulo = document.getElementById("modal-titulo");

            // Actualizar título del modal
            titulo.textContent = tituloCategoria;

            // Limpiar productos anteriores
            contenedor.innerHTML = "";

            // Insertar nuevos productos
            data.forEach(producto => {
                const item = document.createElement("div");
                item.classList.add("producto-item");
                item.innerHTML = `
                    <h4>${producto.nombre}</h4>
                    <span>S/ ${producto.precio.toFixed(2)}</span>
                `;
                item.addEventListener("click", () => {
                    console.log("Producto clickeado:", producto.nombre);
                    // Aquí puedes añadir más lógica como agregar al pedido, etc.
                });
                contenedor.appendChild(item);
            });

            // Mostrar el modal quitando "oculto" y agregando "activo"
            modal.classList.remove("oculto");
            modal.classList.add("activo");
        })
        .catch(error => console.error("Error al cargar productos:", error));
}


// Cerrar modal con la X
document.getElementById("cerrar-modal").addEventListener("click", () => {
    console.log("Cerrando modal"); // Verificar si se ejecuta al cerrar el modal
    const modal = document.getElementById("modal-productos");
    modal.classList.add("oculto");
    modal.classList.remove("activo");
});

// Cerrar modal al hacer clic fuera del contenido
document.getElementById("modal-productos").addEventListener("click", function (e) {
    if (e.target === this) {
        console.log("Cerrando modal al hacer clic fuera"); // Verificar si se cierra al hacer clic fuera
        this.classList.add("oculto");
        this.classList.remove("activo");
    }
});


document.getElementById("categoria-entrada").addEventListener("click", function() {
    cargarProductosPorTipo(1, "Entradas");
});

document.getElementById("categoria-segundo").addEventListener("click", function() {
    cargarProductosPorTipo(2, "Segundos");
});

document.getElementById("categoria-bebida").addEventListener("click", function() {
    cargarProductosPorTipo(3, "Bebidas");
});

document.getElementById("categoria-postre").addEventListener("click", function() {
    cargarProductosPorTipo(4, "Postres");
});



// Cerrar el modal cuando se presiona la tecla Escape
document.addEventListener('keydown', (event) => {
    const modal = document.getElementById("modal-productos");

    // Verifica si la tecla presionada es Escape (keyCode 27) y si el modal está activo
    if (event.key === "Escape" && modal.classList.contains("activo")) {
        modal.classList.add("oculto");
        modal.classList.remove("activo");
    }
});

