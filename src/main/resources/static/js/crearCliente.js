document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-crear-cliente");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Capturar valores de los inputs individualmente
        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const documento = document.getElementById("documento").value.trim();
        const direccion = document.getElementById("direccion").value.trim();

        const cliente = { nombre, telefono, documento, direccion };

        mostrarPopupConfirmacion("question", "¿Deseas crear este cliente?", async () => {
            try {
                const response = await fetch("/mesalista/api/cliente/addcliente_sp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(cliente)
                });

                if (response.ok) {
                    const result = await response.json();
                   
                    if (result.created) {
                        mostrarPopupConfirmacion("success", result.msg + " " + cliente.nombre, () => {
                            form.reset();
                        }, null);
                    } else {
						// Había un cliente con ese documento registrado
                        mostrarPopupConfirmacion("warning", result.msg, null, null);
                    }
                } else {
                    const errorText = await response.text();
                    mostrarPopupConfirmacion("error", `Error al crear el cliente: ${errorText}`, null, null);
                }
            } catch (err) {
                mostrarPopupConfirmacion("error", "Error de conexión con el servidor.", null, null);
            }
        }, () => {
            // Cancelación, no hacer nada
        });
    });
});
