document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedidoId");

    const empleadoIdInput = document.getElementById("empleado-id");
    const direccionEntregaInput = document.getElementById("direccion-entrega");

    const API_URL_CONFIRMAR = "/mesalista/api/pedido/confirmar";

    if (pedidoId) {
        const detalleUrl = `/mesalista/api/detallepedido/buscaractivo/${pedidoId}`;
        const pedidoUrl = `/mesalista/api/pedido/${pedidoId}`;

        // Cargar detalles del pedido
        fetch(detalleUrl)
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById("detalle-body");
                tbody.innerHTML = "";

                let total = 0;

                data.forEach(detalle => {
                    const fila = document.createElement("tr");
                    const subtotal = detalle.cantidad * detalle.precioUnitario;
                    total += subtotal;

                    fila.innerHTML = `
                        <td>${detalle.id}</td>
                        <td>${detalle.producto.nombre}</td>
                        <td>${detalle.cantidad}</td>
                        <td>S/ ${detalle.precioUnitario.toFixed(2)}</td>
                        <td>S/ ${subtotal.toFixed(2)}</td>
                    `;
                    tbody.appendChild(fila);
                });

                document.getElementById("total-pedido").textContent = ` S/${total.toFixed(2)}`;
            })
            .catch(err => console.error("Error al obtener detalles del pedido:", err));

        // Obtener clienteId desde el pedido
        fetch(pedidoUrl)
            .then(res => res.json())
            .then(pedido => {
                const clienteId = pedido.cliente?.id;
                if (clienteId) {
                    // Obtener dirección desde el cliente
                    fetch(`/mesalista/api/cliente/${clienteId}`)
                        .then(res => res.json())
                        .then(cliente => {
                            if (cliente.direccion) {
                                direccionEntregaInput.placeholder = cliente.direccion;
                            }
                        })
                        .catch(err => console.error("Error al obtener datos del cliente:", err));
                }
            })
            .catch(err => console.error("Error al obtener datos del pedido:", err));
    } else {
        console.warn("No se encontró el pedidoId en la URL");
    }

    document.getElementById("btn-confirmar-final").addEventListener("click", () => {
        const empleadoId = empleadoIdInput.value;
        const direccionEntrega = direccionEntregaInput.value || "";

        if (!pedidoId || !empleadoId) {
            alert("Faltan datos necesarios: Pedido o Empleado.");
            return;
        }

        const formData = new URLSearchParams();
        formData.append("pedidoId", pedidoId);
        formData.append("empleadoId", empleadoId);
        if (direccionEntrega.trim()) {
            formData.append("direccionEntrega", direccionEntrega);
        }

        fetch(API_URL_CONFIRMAR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.text(); // porque el backend devuelve texto plano, no JSON
        })
        .then(message => {
            alert(message);
            localStorage.clear();
            window.location.href = "/mesalista";
        })
        .catch(err => {
            console.error("Error al confirmar el pedido:", err);
            alert("Hubo un error en la solicitud.");
        });
    });
});
