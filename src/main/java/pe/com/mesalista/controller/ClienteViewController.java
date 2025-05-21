package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cliente")
public class ClienteViewController {


    // Vista del formulario de registro de cliente
    @GetMapping("/registrar")
    public String vistaRegistroCliente() {
        return "crearCliente";  // Redirige a la plantilla crearCliente.html
    }
    
    // Vista de los clientes (activos, inactivos, etc.)
    @GetMapping({"", "/", "/activo", "/inactivo"})
    public String vistaCliente() {
        return "Clientes";  // Asegúrate de tener la vista 'Clientes.html' para listar clientes
    }

}
