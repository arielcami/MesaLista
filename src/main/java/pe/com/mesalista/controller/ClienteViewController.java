package pe.com.mesalista.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;  // Asegúrate de tener el servicio adecuado

@Controller
@RequestMapping("/cliente")
public class ClienteViewController {

    @Autowired
    private ClienteService clienteService;  // Inyecta el servicio de cliente para interactuar con la base de datos

    // Vista de los clientes (activos, inactivos, etc.)
    @GetMapping({"", "/", "/activo", "/inactivo"})
    public String vistaCliente() {
        return "Clientes";  // Asegúrate de tener la vista 'Clientes.html' para listar clientes
    }

    // Vista del formulario de registro de cliente
    @GetMapping("/registrar")
    public String vistaRegistroCliente() {
        return "crearCliente";  // Redirige a la plantilla crearCliente.html
    }

    // Método para registrar un nuevo cliente
    @PostMapping("/registrar")
    public String registrarCliente(@ModelAttribute ClienteEntity cliente) {
        // Lógica para guardar el cliente en la base de datos
        clienteService.save(cliente);  // Guarda el cliente usando el servicio adecuado

        return "redirect:/cliente";  // Redirige a la lista de clientes después de registrar
    }

}
