function formatearTelefono(telefono) {
    telefono = telefono.toString().replace(/\D/g, '');

    if (telefono.length === 9) {
        return telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    }

    return telefono.replace(/\B(?=(\d{3})+(?!\d))/g, '-');
}

document.addEventListener('DOMContentLoaded', function () {
    const clienteId = document.getElementById("clienteId").value;

    fetch(`/mesalista/api/cliente/${clienteId}`)
        .then(response => response.json())
        .then(cliente => {

            const telefonoFormateado = formatearTelefono(cliente.telefono);

            // Insertar los datos en el DOM sin duplicar contenido
			document.getElementById("cliente-id").textContent = cliente.id;
            document.getElementById("cliente-nombre").textContent = cliente.nombre;
			document.getElementById("telefono-formateado").textContent = telefonoFormateado;
			document.getElementById("cliente-documento").textContent = cliente.documento;
            document.getElementById("cliente-direccion").textContent = cliente.direccion;
        })
        .catch(error => {
            console.error("Error al obtener los datos del cliente:", error);
        });
});
