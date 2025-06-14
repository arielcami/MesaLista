package pe.com.mesalista.RESTcontroller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import pe.com.mesalista.entity.ProductoEntity;
import pe.com.mesalista.service.ProductoService;

@RestController
@RequestMapping("/api/producto")
@RequiredArgsConstructor
public class ProductoRestController {

	private final ProductoService productoService;

	@GetMapping
	public List<ProductoEntity> findAll() {
		return productoService.findAll().stream().sorted(Comparator.comparingInt(ProductoEntity::getTipoProducto))
				.toList();
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProductoEntity> findById(@PathVariable Long id) {
		return productoService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	// Guardar nuevo producto, con imagen o no
	@PostMapping
	public ResponseEntity<ProductoEntity> saveConImagen(@RequestPart("producto") ProductoEntity producto,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		try {
			if (imagen != null && !imagen.isEmpty()) {
				String nombreArchivo = System.currentTimeMillis() + "_" + imagen.getOriginalFilename();
				Path rutaImagen = Paths.get("img-realtime", nombreArchivo);
				Files.createDirectories(rutaImagen.getParent());
				Files.copy(imagen.getInputStream(), rutaImagen, StandardCopyOption.REPLACE_EXISTING);
				producto.setImagenUrl("img-realtime/" + nombreArchivo);
			}

			ProductoEntity productoGuardado = productoService.save(producto);
			return ResponseEntity.ok(productoGuardado);

		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
	public ResponseEntity<ProductoEntity> updateConImagen(@PathVariable Long id,
			@RequestPart("producto") ProductoEntity producto,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		try {
			// Verificar si el producto existe
			Optional<ProductoEntity> existenteOpt = productoService.findById(id);
			if (existenteOpt.isEmpty()) {
				return ResponseEntity.notFound().build();
			}

			ProductoEntity existente = existenteOpt.get();

			// Copiar el ID al nuevo producto
			producto.setId(id);

			// Manejar imagen nueva
			if (imagen != null && !imagen.isEmpty()) {

				// Eliminar imagen anterior si existe
				String imagenAnterior = existente.getImagenUrl();
				if (imagenAnterior != null && !imagenAnterior.isBlank()) {
					// Obtener solo el nombre del archivo por seguridad
					String nombreImagenAnterior = Paths.get(imagenAnterior).getFileName().toString();
					Path rutaImagenAnterior = Paths.get("img-realtime", nombreImagenAnterior);
					try {
						Files.deleteIfExists(rutaImagenAnterior);
					} catch (IOException e) {
						System.err.println("No se pudo eliminar la imagen anterior: " + e.getMessage());
					}
				}

				// Guardar nueva imagen
				String nombreArchivo = System.currentTimeMillis() + "_" + imagen.getOriginalFilename();
				Path rutaImagen = Paths.get("img-realtime", nombreArchivo);
				Files.createDirectories(rutaImagen.getParent());
				Files.copy(imagen.getInputStream(), rutaImagen, StandardCopyOption.REPLACE_EXISTING);

				// Guardar solo el nombre del archivo
				producto.setImagenUrl("img-realtime/" + nombreArchivo);
			} else {
				// Mantener imagen anterior si no se subió nueva
				producto.setImagenUrl(existente.getImagenUrl());
			}

			// Guardar cambios
			ProductoEntity actualizado = productoService.update(id, producto).orElseThrow();
			return ResponseEntity.ok(actualizado);

		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
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
		return productoService.findByEstadoTrue().stream()
				.sorted(Comparator.comparingInt(ProductoEntity::getTipoProducto)).toList();
	}

	@GetMapping("/inactivos")
	public List<ProductoEntity> findByEstadoFalse() {
		return productoService.findByEstadoFalse().stream()
				.sorted(Comparator.comparingInt(ProductoEntity::getTipoProducto)).toList();
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

	@PatchMapping("/{id}/estado")
	public ResponseEntity<?> parcharEstadoProducto(@PathVariable Long id, @RequestParam boolean estado) {
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
