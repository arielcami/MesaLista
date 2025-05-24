package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.service.PedidoService;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/pedido")
public class PedidoRestController {

	@Autowired
	private PedidoService servicio;

	@GetMapping
	public List<PedidoEntity> findAll() {
		return servicio.findAll();
	}
	
	@GetMapping("/cocina")
	public List<PedidoEntity> obtenerPedidosParaCocina() {
	    return servicio.findPedidosParaCocina();
	}
	
	@GetMapping("/estado/{estado}")
	public List<PedidoEntity> findByEstadoPedido(@PathVariable byte estado) {
		return servicio.findByEstadoPedido(estado);
	}

	@GetMapping("/cliente/{clienteId}")
	public List<PedidoEntity> findByClienteId(@PathVariable Long clienteId) {
		return servicio.findByClienteId(clienteId);
	}

	@GetMapping("/{id}")
	public ResponseEntity<PedidoEntity> findById(@PathVariable Long id) {
		PedidoEntity pedido = servicio.findById(id);
		return pedido != null ? ResponseEntity.ok(pedido) : ResponseEntity.notFound().build();
	}

	// Forma manual, mejor usa el Stored Procedure
	@PostMapping
	public ResponseEntity<PedidoEntity> add(@RequestBody PedidoEntity pedido) {
		PedidoEntity nuevoPedido = servicio.save(pedido);
		return new ResponseEntity<>(nuevoPedido, HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<PedidoEntity> update(@RequestBody PedidoEntity pedido, @PathVariable Long id) {
		PedidoEntity pedidoActualizado = servicio.update(pedido, id);
		return pedidoActualizado != null ? ResponseEntity.ok(pedidoActualizado) : ResponseEntity.notFound().build();
	}
	
	@PutMapping("/{id}/set-delivery/{deliveryId}")
    public ResponseEntity<PedidoEntity> asignarDelivery(
            @PathVariable Long id,
            @PathVariable Long deliveryId) {
        PedidoEntity actualizado = servicio.asignarDelivery(id, deliveryId);
        return ResponseEntity.ok(actualizado);
    }
	

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		servicio.delete(id);
		return ResponseEntity.noContent().build();
	}
	
	// Endpoint para confirmar el pedido
	@PostMapping("/confirmar")
	public ResponseEntity<String> confirmarPedido(@RequestParam Long pedidoId, @RequestParam Long empleadoId, 
	        @RequestParam(required = false) String direccionEntrega) {
	    
	    try {
	        servicio.confirmarPedido(pedidoId, empleadoId, direccionEntrega);
	        return ResponseEntity.ok("Pedido confirmado correctamente.");
	    } catch (Exception e) {
	        String mensajeLimpio = "Error al confirmar el pedido.";

	        // Buscar si hay una SQLException en la causa
	        Throwable causa = e;
	        while (causa != null) {
	            if (causa instanceof SQLException) {
	                mensajeLimpio = causa.getMessage();
	                break;
	            }
	            causa = causa.getCause();
	        }

	        return ResponseEntity.status(500).body(mensajeLimpio);
	    }
	}
	
}
