package pe.com.mesalista.RESTcontroller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.service.CarritoService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sp")
public class CarritoRestController {

	private final CarritoService carritoService;

	// Endpoint para agregar un producto al pedido
	@PostMapping("/add")
	public ResponseEntity<Object> agregarProductoAlPedido(@RequestParam Long clienteId, @RequestParam Long productoId,
			@RequestParam Integer cantidad, @RequestParam double precioUnitario) {

		try {
			// Llamar al servicio para agregar el producto al pedido y obtener el pedido_id
			Long pedidoId = carritoService.agregarProducto(clienteId, productoId, cantidad, precioUnitario);

			// Retornar una respuesta exitosa con el pedido_id en el cuerpo de la respuesta
			return ResponseEntity.status(HttpStatus.CREATED)
					.body("{\"message\": \"Producto agregado con éxito\", \"pedido_id\": " + pedidoId + "}");
		} catch (Exception e) {
			// Manejar excepciones y retornar error con JSON
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("{\"message\": \"Error al agregar producto al pedido: " + e.getMessage() + "\"}");
		}
	}

	// Endpoint para ajustar la cantidad de un producto en el pedido
	@PutMapping("/delta")
	public ResponseEntity<String> ajustarCantidadProducto(@RequestParam Long pedidoId, @RequestParam Long productoId,
			@RequestParam int delta) {

		try {
			carritoService.ajustarCantidadProducto(pedidoId, productoId, delta);
			return ResponseEntity.ok("Cantidad ajustada con éxito.");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error al ajustar la cantidad del producto: " + e.getMessage());
		}
	}
}
