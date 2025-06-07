package pe.com.mesalista.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import pe.com.mesalista.service.EmpleadoService;

@Controller
@RequestMapping("/reportes")
public class ReportesController {

	@Autowired
	private EmpleadoService service;
	
	// Abre la página de reportes
	@GetMapping
	public String mostrarReportes() {
		return "Reportes";
	}

	// Método nuevo que valida el acceso
	@GetMapping("/acceso")
	public String mostrarReportesConValidacion(
	    @RequestParam Long idEmpleado,
	    @RequestParam String clave,
	    Model model) {

	    Map<String, Object> resultado = service.validarCredenciales(idEmpleado.intValue(), clave);
	    Boolean esValido = (Boolean) resultado.get("p_es_valido");
	    String mensaje = (String) resultado.get("p_mensaje");

	    if (Boolean.TRUE.equals(esValido)) {
	        return "Reportes";
	    } else {
	        model.addAttribute("mensaje", mensaje);
	        return "acceso-denegado";
	    }
	}	
}
