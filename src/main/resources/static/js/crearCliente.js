document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-crear-cliente");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const confirmed = confirm("¿Deseas crear este cliente?");
        if (!confirmed) return;

        const formData = new FormData(form);
        const cliente = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/mesalista/api/cliente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                mostrarPopupCustom("success", "Cliente creado exitosamente.");
                form.reset();
            } else {
                const errorText = await response.text();
                mostrarPopupCustom("error", `Error al crear el cliente: ${errorText}`);
            }
        } catch (err) {
            mostrarPopupCustom("error", "Error de conexión con el servidor.");
        }
    });
});
