

document.addEventListener('DOMContentLoaded', function () {
    const nombreInput = document.getElementById('nombre');
    const documentoInput = document.getElementById('documento');

    nombreInput.addEventListener('input', function () {
        if (this.value.trim().length > 0) {
            documentoInput.value = '';
        }
    });

    documentoInput.addEventListener('input', function () {
        if (this.value.trim().length > 0) {
            nombreInput.value = '';
        }
    });
});



// Redirigir a la página principal
function redirigirAPaginaPrincipal() {
    window.location.href = '/mesalista/';  // Redirige a la página principal
}

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();

    if (nombre === '' && documento === '') {
        mostrarPopupCustom("error", "Por favor, ingrese al menos un nombre o un documento para buscar.");
        return false;
    }

    return true;
}

function manejarBusquedaSinResultados() {
    mostrarPopupCustom("error", "No se encontraron resultados con los criterios de búsqueda.");
}


function validarSeleccion() {
    const seleccionado = document.querySelector('input[name="clienteSeleccionado"]:checked');
    if (!seleccionado) {
        mostrarPopupCustom("warning","Por favor, seleccione un cliente antes de continuar.");
    }
    return true;
}


