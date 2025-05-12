package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cliente")
public class ClienteRestController {

    @Autowired
    private ClienteService servicio;

    @GetMapping
    public List<ClienteEntity> findAll() {
        return servicio.findAll();
    }

    
    @GetMapping("/activo")
    public List<ClienteEntity> findAllCustom() {
        return servicio.findAllCustom();
    }

    @GetMapping("/inactivo")
    public List<ClienteEntity> findAllInactive() {
        return servicio.findAllInactive();
    }

    @GetMapping("/nombre/{nombre}")
    public List<ClienteEntity> findByNombre(@PathVariable String nombre) {
        return servicio.findByNombreContainingIgnoreCase(nombre);
    }
    
    /*
    @GetMapping("/buscar")
    public List<ClienteEntity> buscarPorNombreODocumento(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String documento) {

        if ((nombre == null || nombre.isBlank()) && (documento == null || documento.isBlank())) {
            return List.of(); // Devuelve lista vacía si no hay parámetros
        }

        if (nombre != null && !nombre.isBlank()) {
            return servicio.findByNombreContainingIgnoreCase(nombre);
        }

        // Aquí se asume que tienes un método similar para buscar por documento
        return servicio.findByDocumentoContainingIgnoreCase(documento);
    }
    */


    @GetMapping("/{id}")
    public ClienteEntity findById(@PathVariable Long id) {
        return servicio.findById(id);
    }

    @PostMapping
    public ClienteEntity add(@RequestBody ClienteEntity cliente) {
        return servicio.save(cliente);
    }

    @PutMapping("/{id}")
    public ClienteEntity update(@RequestBody ClienteEntity cliente, @PathVariable Long id) {
        return servicio.update(cliente, id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        servicio.delete(id);
    }

    @PutMapping("/enable/{id}")
    public ClienteEntity enable(@PathVariable Long id) {
        return servicio.enable(id);
    }
    
    @PutMapping("/{id}/estado")
	public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestParam boolean estado) {
	    Optional<ClienteEntity> resultado = servicio.actualizarEstado(id, estado);

	    if (resultado.isPresent()) {
	        return ResponseEntity.ok(resultado.get());
	    } else {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente no encontrado");
	    }
	}
    
}
