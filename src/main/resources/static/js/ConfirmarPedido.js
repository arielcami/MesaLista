// confirmacion.js (JS cargado en ConfirmarPedido.html)
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedidoId");

    const API_URL_BASE = "/mesalista/api/detallepedido/buscaractivo";

    if (pedidoId) {
        const url = `${API_URL_BASE}/${pedidoId}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById("detalle-body");
                tbody.innerHTML = ""; // Limpia contenido previo si lo hay

                data.forEach(detalle => {
                    const fila = document.createElement("tr");

                    const subtotal = (detalle.cantidad * detalle.precioUnitario).toFixed(2);

                    fila.innerHTML = `
                        <td>${detalle.id}</td>
                        <td>${detalle.producto.nombre}</td>
                        <td>${detalle.cantidad}</td>
                        <td>S/ ${detalle.precioUnitario.toFixed(2)}</td>
                        <td>S/ ${subtotal}</td>
                    `;

                    tbody.appendChild(fila);
                });
            })
            .catch(err => console.error("Error al obtener detalles del pedido:", err));
    } else {
        console.warn("No se encontró el pedidoId en la URL");
    }
});

document.getElementById("btn-confirmar-final").addEventListener("click", () => {
    localStorage.clear();
    alert("¡Pedido confirmado!");
});

