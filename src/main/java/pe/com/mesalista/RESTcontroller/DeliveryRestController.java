package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.DeliveryEntity;
import pe.com.mesalista.service.DeliveryService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryRestController {

	@Autowired
	private DeliveryService servicio;

	@GetMapping
	public List<DeliveryEntity> findAll() { // Postman: OK!
		return servicio.findAll();
	}
	
	@PostMapping("/validar")
	public ResponseEntity<Map<String, Object>> validarEmpleado(@RequestBody Map<String, Object> payload) {
	    try {
	        int id = ((Number) payload.get("id")).intValue();  // cast seguro
	        String clave = (String) payload.get("clave");

	        Map<String, Object> resultado = servicio.validarCredenciales(id, clave);

	        return ResponseEntity.ok(resultado);
	    } catch (Exception e) {
	        e.printStackTrace();  // Para ver el error completo en consola
	        return ResponseEntity.badRequest()
	            .body(Map.of("p_es_valido", false, "p_mensaje", "Error en autenticación"));
	    }
	}

	@GetMapping("/estado/{estado}")
	public List<DeliveryEntity> findByEstado(@PathVariable boolean estado) { // Postman: OK!
		return servicio.findByEstado(estado);
	}

	@GetMapping("/placa/{placa}")
	public List<DeliveryEntity> findByPlaca(@PathVariable String placa) { // Postman: OK!
		return servicio.findByPlaca(placa);
	}

	@GetMapping("/{id}")
	public DeliveryEntity findById(@PathVariable Long id) { // Postman: OK!
		return servicio.findById(id);
	}

	@PostMapping
	public DeliveryEntity add(@RequestBody DeliveryEntity delivery) { // Postman: OK!
		return servicio.save(delivery);
	}

	@PutMapping("/{id}")
	public DeliveryEntity update(@RequestBody DeliveryEntity delivery, @PathVariable Long id) { // Postman: OK!
		return servicio.update(delivery, id);
	}

	@DeleteMapping("/{id}")
	public DeliveryEntity delete(@PathVariable Long id) { // Postman: OK!
		return servicio.delete(id);
	}

	@PutMapping("/enable/{id}")
	public DeliveryEntity enable(@PathVariable Long id) { // Postman: OK!
		return servicio.enable(id);
	}
}
