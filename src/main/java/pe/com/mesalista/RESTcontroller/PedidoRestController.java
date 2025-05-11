package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.service.PedidoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedido")
public class PedidoRestController {

	@Autowired
	private PedidoService servicio;

	@GetMapping
	public List<PedidoEntity> findAll() {
		return servicio.findAll();
	}
	
	// Endpoint para el SP
	@PostMapping("/agregar-producto")
	public ResponseEntity<Void> agregarProductoAlPedido(@RequestBody Map<String, Object> requestBody) {
	    // Obtener los valores del Map y asegurarse de convertirlos al tipo correcto
	    Long clienteId = Long.parseLong(requestBody.get("clienteId").toString());
	    Long empleadoId = Long.parseLong(requestBody.get("empleadoId").toString());
	    Long productoId = Long.parseLong(requestBody.get("productoId").toString());
	    Integer cantidad = Integer.parseInt(requestBody.get("cantidad").toString());
	    String direccionEntrega = (String) requestBody.get("direccionEntrega");
	    
	    // Llamamos al servicio para agregar el producto al pedido
	    servicio.agregarProductoAlPedido(clienteId, empleadoId, productoId, cantidad, direccionEntrega);
	    
	    return ResponseEntity.status(HttpStatus.OK).build();
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
}
