package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.EmpleadoEntity;
import pe.com.mesalista.service.EmpleadoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empleado")
public class EmpleadoRestController {

	// Inyección de dependencias
	@Autowired
	private EmpleadoService servicio;
	
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
	
	
	@PostMapping("/validar-delivery")
	public ResponseEntity<Map<String, Object>> validarDelivery(@RequestBody Map<String, Object> payload) {
	    try {
	        int id = ((Number) payload.get("id")).intValue();
	        String clave = (String) payload.get("clave");

	        Map<String, Object> resultado = servicio.validarDeliveryCredenciales(id, clave);

	        return ResponseEntity.ok(resultado);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.badRequest()
	            .body(Map.of("p_es_valido", false, "p_mensaje", "Error en autenticación"));
	    }
	}

	
	@GetMapping("/nivel/{nivel}")
	public List<EmpleadoEntity> findByNivel(@PathVariable int nivel) {
	    return servicio.findByNivel(nivel);
	}


	@GetMapping
	public List<EmpleadoEntity> findAll() {
		return servicio.findAll();
	}

	@GetMapping("/{id}")
	public EmpleadoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@GetMapping("/nombre/{nombre}")
    public List<EmpleadoEntity> findByNombre(@PathVariable String nombre) {
        return servicio.findByNombreIgnoreCase(nombre);
    }

	// Endpoint para obtener empleados por estado
	@GetMapping("/estado/{estado}")
	public List<EmpleadoEntity> findByEstado(@PathVariable boolean estado) {
		return servicio.findByEstado(estado);
	}

	@PostMapping
	public EmpleadoEntity add(@RequestBody EmpleadoEntity usuario) {
		return servicio.save(usuario);
	}

	@PutMapping("/{id}")
	public EmpleadoEntity update(@RequestBody EmpleadoEntity usuario, @PathVariable Long id) {
		return servicio.update(usuario, id);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		servicio.delete(id);
	}

	@PutMapping("/enable/{id}")
	public EmpleadoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
