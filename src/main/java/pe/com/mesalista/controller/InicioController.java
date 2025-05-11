package pe.com.mesalista.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;

import java.util.List;

@Controller
public class InicioController {
	
	
	 @Autowired
	 private ClienteService servicio;

	@Controller
	public class HomeController {

	    @GetMapping("/")
	    public String home() {
	        return "Inicio"; // Carga src/main/resources/templates/Inicio.html
	    }
	}
	
	
	@GetMapping("/cliente/buscar")
	public String buscarPorNombreODocumento(
	        @RequestParam(required = false) String nombre,
	        @RequestParam(required = false) String documento,
	        Model model) {

	    List<ClienteEntity> resultados = List.of();

	    if (nombre != null && !nombre.isBlank()) {
	        // Si hay nombre, se ignora el documento
	        resultados = servicio.findByNombreContainingIgnoreCase(nombre);
	    } else if (documento != null && !documento.isBlank()) {
	        resultados = servicio.findByDocumentoContainingIgnoreCase(documento);
	    }

	    if (resultados.isEmpty()) {
	        model.addAttribute("sinResultados", true);
	    } else {
	        model.addAttribute("clientes", resultados);
	    }

	    return "Inicio";
	}	
}






