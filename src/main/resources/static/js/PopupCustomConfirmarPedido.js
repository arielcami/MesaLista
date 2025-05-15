function mostrarPopupConfirmacion(tipo, mensaje, onConfirm) {
    const modal = document.getElementById('popup-custom-modal');
    const mensajeElem = document.getElementById('popup-message');
    const iconoElem = document.getElementById('popup-icon');
    const btnConfirmar = document.getElementById('popup-confirm-btn');
    const btnCancelar = document.getElementById('popup-cancel-btn');

    mensajeElem.textContent = mensaje;
    iconoElem.style.backgroundImage = `url('/mesalista/img/${tipo.charAt(0).toUpperCase() + tipo.slice(1)}.png')`;

    modal.classList.remove('hidden');

    // Limpiar y volver a asociar eventos
    const nuevoConfirmar = btnConfirmar.cloneNode(true);
    const nuevoCancelar = btnCancelar.cloneNode(true);

    btnConfirmar.parentNode.replaceChild(nuevoConfirmar, btnConfirmar);
    btnCancelar.parentNode.replaceChild(nuevoCancelar, btnCancelar);

    nuevoConfirmar.addEventListener('click', function () {
        modal.classList.add('hidden');
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    nuevoCancelar.addEventListener('click', function () {
        modal.classList.add('hidden');
    });
}


document.getElementById("btn-cancelar").addEventListener("click", function () {
	
    mostrarPopupConfirmacion("warning", "¿Cancelar el pedido?", function () {
        localStorage.clear();
        window.location.href = "/mesalista";
    });
	
});
