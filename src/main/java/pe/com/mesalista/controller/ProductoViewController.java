package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/producto") 
public class ProductoViewController {

    @GetMapping({"", "/", "/activos", "/inactivos"})
    public String vistaProducto() {
        return "Productos";  // Nombre de tu plantilla HTML
    }    
}

