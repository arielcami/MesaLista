package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/entregas")
public class EntregasController {
	
	@GetMapping
	public String cargarEntregasIndex() {
		return "Entregas";
	}

}
