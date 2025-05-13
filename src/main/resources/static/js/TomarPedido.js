function formatearTelefono(telefono) {
    telefono = telefono.toString().replace(/\D/g, '');

    if (telefono.length === 9) {
        return telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    }

    return telefono.replace(/\B(?=(\d{3})+(?!\d))/g, '-');
}

document.addEventListener('DOMContentLoaded', function () {
    // Obtener datos desde inputs ocultos
    const nombre = document.getElementById("cliente-nombre-hidden").value;
    const documento = document.getElementById("cliente-documento-hidden").value;
    const telefono = document.getElementById("cliente-telefono-hidden").value;
    const direccion = document.getElementById("cliente-direccion-hidden").value;

    const telefonoFormateado = formatearTelefono(telefono);

    // Insertar datos visibles en los spans
    document.getElementById("cliente-nombre").textContent = nombre;
    document.getElementById("cliente-documento").textContent = documento;
    document.getElementById("telefono-formateado").textContent = telefonoFormateado;
    document.getElementById("cliente-direccion").textContent = direccion;
});

