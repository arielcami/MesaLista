package pe.com.mesalista.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/pedido")
public class PedidoController {
	
	@GetMapping("/cocina")
	public String mostrarPedido() {
		return "Cocina";
	}
	
	@GetMapping("/incidente")
	public String mostrarIncidentes() {
		return "Incidentes";
	}
	
	@GetMapping("/cocina/control")
	public String controlDePedidos() {
		return "CocinaPedidosControl";
	}
	
    @GetMapping("/confirmar")
    public String siguiente(@RequestParam Long pedidoId, Model model) {
        // Agregar el pedidoId al modelo
        model.addAttribute("pedidoId", pedidoId);
        return "ConfirmarPedido"; // Nombre de la vista (plantilla)
    }
    
    @GetMapping("/confirmar/ok")
    public String siguiente() {
        return "Inicio"; // Nombre de la vista (plantilla)
    }
}
