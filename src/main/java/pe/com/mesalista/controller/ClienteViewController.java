package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cliente")
public class ClienteViewController {

    @GetMapping("/registrar")
    public String vistaRegistroCliente() {
        return "CrearCliente"; 
    }
    
    @GetMapping({"", "/", "/activo", "/inactivo"})
    public String vistaCliente() {
        return "Clientes";
    }

}
