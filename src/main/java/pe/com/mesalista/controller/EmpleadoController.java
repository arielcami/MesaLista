package pe.com.mesalista.controller;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
//import pe.com.mesalista.service.EmpleadoService;

@Controller
@RequestMapping("/empleado")
public class EmpleadoController {

	//@Autowired
	//private EmpleadoService service;
	
	// Vista de los clientes (activos, inactivos, etc.)
    @GetMapping({"", "/", "/activo", "/inactivo"})
    public String vistasEmpleados() {
        return "Empleados";
    }
    
 // Vista de los clientes (activos, inactivos, etc.)
    @GetMapping("/deliveries")
    public String vistasDeliveries() {
        return "Deliveries";
    }
    
}
