package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/mesas")
public class MesaController {
	
	@GetMapping
	public String showFront() {
		return "Mesas";
	}

}
