package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/recuperar") 
public class RecuperarClaveController {
	
	@GetMapping()
	public String mostrarPantala() {
		return "RecuperarClave";
	}
}
