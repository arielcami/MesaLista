

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





function mostrarPopup(mensaje) {
    const overlay = document.getElementById('popup-overlay');
    const popupMessage = document.getElementById('popup-message');

    popupMessage.textContent = mensaje;
    overlay.style.display = 'flex'; // Mostramos el overlay completo

    // Cerrar al hacer clic fuera
    overlay.onclick = function (event) {
        if (event.target === overlay) {
            overlay.style.display = 'none';
            // redirigirAPaginaPrincipal();
        }
    };

    // Botón de cerrar
    document.getElementById('popup-close').onclick = function () {
        overlay.style.display = 'none';
        // redirigirAPaginaPrincipal();
    };
}

// Redirigir a la página principal
function redirigirAPaginaPrincipal() {
    window.location.href = '/mesalista/';  // Redirige a la página principal
}

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();

    if (nombre === '' && documento === '') {
        mostrarPopup("Por favor, ingrese al menos un nombre o un documento para buscar.");
        return false;
    }

    return true;
}

function manejarBusquedaSinResultados() {
    mostrarPopup("No se encontraron resultados con los criterios de búsqueda.");
}


function validarSeleccion() {
    const seleccionado = document.querySelector('input[name="clienteSeleccionado"]:checked');
    if (!seleccionado) {
        mostrarPopup("Por favor, seleccione un cliente antes de continuar.");
    }
    return true;
}


