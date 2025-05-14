package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.DetallePedidoEntity;
import pe.com.mesalista.service.DetallePedidoService;
import java.util.List;

@RestController
@RequestMapping("/api/detallepedido")
public class DetallePedidoRestController {

	@Autowired
	private DetallePedidoService servicio;

	// Obtener todos los detalles de pedidos
	@GetMapping
	public List<DetallePedidoEntity> findAll() {
		return servicio.findAll();
	}

	// Filtrar detalles de pedidos por estado
	@GetMapping("/estado/{estado}")
	public List<DetallePedidoEntity> findByEstado(@PathVariable byte estado) {
		return servicio.findByEstado(estado);
	}

	// Filtrar detalles de pedidos por pedido_id
	@GetMapping("/pedido/{pedidoId}")
	public List<DetallePedidoEntity> findByPedidoId(@PathVariable Long pedidoId) {
		return servicio.findByPedidoId(pedidoId);
	}

	// Filtrar detalles de pedidos por pedido_id y producto_id
	@GetMapping("/pedido/{pedidoId}/producto/{productoId}")
	public List<DetallePedidoEntity> findByPedidoIdAndProductoId(@PathVariable Long pedidoId,
			@PathVariable Long productoId) {
		return servicio.findByPedidoIdAndProductoId(pedidoId, productoId);
	}

	// Obtener detalle de pedido por ID
	@GetMapping("/{id}")
	public DetallePedidoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}

	// Crear un nuevo detalle de pedido
	@PostMapping
	public DetallePedidoEntity add(@RequestBody DetallePedidoEntity detallePedido) {
		return servicio.save(detallePedido);
	}

	// Actualizar un detalle de pedido
	@PutMapping("/{id}")
	public DetallePedidoEntity update(@RequestBody DetallePedidoEntity detallePedido, @PathVariable Long id) {
		return servicio.update(detallePedido, id);
	}

	// Eliminar un detalle de pedido (baja lógica)
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		servicio.delete(id);
	}
}
