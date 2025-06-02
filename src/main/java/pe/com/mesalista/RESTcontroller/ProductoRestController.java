package pe.com.mesalista.RESTcontroller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.ProductoEntity;
import pe.com.mesalista.service.ProductoService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/producto")
@RequiredArgsConstructor
public class ProductoRestController {

	private final ProductoService productoService;

	@GetMapping
	public List<ProductoEntity> findAll() {
		return productoService.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProductoEntity> findById(@PathVariable Long id) {
		return productoService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ProductoEntity save(@RequestBody ProductoEntity producto) {
		return productoService.save(producto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ProductoEntity> update(@PathVariable Long id, @RequestBody ProductoEntity producto) {
		return productoService.update(id, producto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/reset-estado")
	public void resetearEstadoProductos() {
		productoService.resetEstadoProductos();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteProducto(@PathVariable Long id) {
		return productoService.deleteById(id).map(p -> ResponseEntity.ok("Producto desactivado correctamente"))
				.orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado"));
	}

	@GetMapping("/activos")
	public List<ProductoEntity> findByEstadoTrue() {
		return productoService.findByEstadoTrue();
	}

	@GetMapping("/inactivos")
	public List<ProductoEntity> findByEstadoFalse() {
		return productoService.findByEstadoFalse();
	}

	@GetMapping("/buscar/{nombre}")
	public List<ProductoEntity> findByNombreContaining(@PathVariable String nombre) {
		return productoService.findByNombreContainingIgnoreCase(nombre);
	}

	@GetMapping("/buscar-nombre-activo/{nombre}")
	public List<ProductoEntity> findByNombreContainingIgnoreCaseAndEstadoTrue(@PathVariable String nombre) {
		return productoService.findByNombreContainingIgnoreCaseAndEstadoTrue(nombre);
	}

	@GetMapping("/tipo/{tipo}")
	public List<ProductoEntity> findByTipoProducto(@PathVariable byte tipo) {
		return productoService.findByTipoProducto(tipo);
	}

	@PutMapping("/{id}/estado")
	public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestParam boolean estado) {
		Optional<ProductoEntity> resultado = productoService.actualizarEstado(id, estado);

		if (resultado.isPresent()) {
			return ResponseEntity.ok(resultado.get());
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado");
		}
	}

	@PutMapping("/{id}/activar")
	public void activarProductoPorId(@PathVariable Integer id) {
		productoService.activarProductoDelDia(id);
	}

	@GetMapping("/tipo/activo/{tipo}")
	public List<ProductoEntity> findActivosByTipo(@PathVariable byte tipo) {
		return productoService.findByTipoProductoAndEstadoTrue(tipo);
	}

}
