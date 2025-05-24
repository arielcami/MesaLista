package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.PageRequest;


@RestController
@RequestMapping("/api/cliente")
public class ClienteRestController {

	@Autowired
	private ClienteService servicio;

	@GetMapping
	public List<ClienteEntity> findAll() {
		return servicio.findAll();
	}

	@PostMapping("addcliente_sp")
	public Map<String, Object> addCliente_sp(@RequestBody ClienteEntity cliente) {
		return servicio.addClienteSP(cliente.getNombre(), cliente.getTelefono(), cliente.getDocumento(),
				cliente.getDireccion());
	}

	@GetMapping("buscar-documento")
	public ClienteEntity findByDocumento(@PathVariable String documento) {
		return servicio.findByDocumento(documento);
	}

	@GetMapping("buscar")
	public List<ClienteEntity> findByDocumentoContainingIgnoreCase(@PathVariable String documento) {
		return servicio.findByDocumentoContainingIgnoreCase(documento);
	}

	@GetMapping("/nombre/{nombre}")
	public List<ClienteEntity> findByNombre(@PathVariable String nombre) {
		return servicio.findByNombreContainingIgnoreCase(nombre);
	}

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

	// Endpoint para paginación total
	@GetMapping("/paginado")
	public Page<ClienteEntity> findAllPaginado(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		return servicio.findAllPaginado(pageable);
	}

	// Endpoint para búsqueda paginada por nombre
	@GetMapping("/paginado/nombre")
	public Page<ClienteEntity> findByNombrePaginado(@RequestParam String nombre,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		return servicio.findByNombreContainingIgnoreCase(nombre, pageable);
	}

}
