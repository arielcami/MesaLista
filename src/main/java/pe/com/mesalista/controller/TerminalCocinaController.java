package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cocina")
public class TerminalCocinaController {
	
	@GetMapping({"", "/", "/activo", "/inactivo"})
	public String mostrar() {
		return "Cocina";
	}

}
