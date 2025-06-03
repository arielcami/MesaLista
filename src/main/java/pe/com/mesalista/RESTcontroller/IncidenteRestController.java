package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.com.mesalista.entity.EmpleadoEntity;
import pe.com.mesalista.entity.IncidenteEntity;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.service.EmpleadoService;
import pe.com.mesalista.service.IncidenteService;
import pe.com.mesalista.service.PedidoService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidente")
public class IncidenteRestController {

	@Autowired
	private IncidenteService servicio;

	@Autowired
	private EmpleadoService empleadoService;

	@Autowired
	private PedidoService pedidoService;

	// Registrar un nuevo incidente
	@PostMapping
	public IncidenteEntity registrar(@RequestBody IncidenteEntity incidente) {

		if (incidente.getDelivery() == null || incidente.getDelivery().getId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery no puede ser nulo");
		}
		if (incidente.getPedido() == null || incidente.getPedido().getId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido no puede ser nulo");
		}

		Long deliveryId = incidente.getDelivery().getId();
		Long pedidoId = incidente.getPedido().getId();

		EmpleadoEntity empleado = empleadoService.findById(deliveryId);
		if (empleado == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Empleado no encontrado con id " + deliveryId);
		}

		PedidoEntity pedido = pedidoService.findById(pedidoId);
		if (pedido == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado con id " + pedidoId);
		}

		incidente.setDelivery(empleado);
		incidente.setPedido(pedido);

		return servicio.registrar(incidente);
	}

	// Listar incidentes por estado
	@GetMapping("/estado/{estado}")
	public List<IncidenteEntity> listarPorEstado(@PathVariable byte estado) {
		return servicio.listarPorEstado(estado);
	}

	// Listar incidentes por delivery ID
	@GetMapping("/delivery/{deliveryId}")
	public List<IncidenteEntity> listarPorDelivery(@PathVariable Long deliveryId) {
		return servicio.listarPorDelivery(deliveryId);
	}

	// Listar incidentes por pedido ID
	@GetMapping("/pedido/{pedidoId}")
	public List<IncidenteEntity> listarPorPedido(@PathVariable Long pedidoId) {
		return servicio.listarPorPedido(pedidoId);
	}

	// Obtener un incidente por ID
	@GetMapping("/{id}")
	public Optional<IncidenteEntity> findById(@PathVariable Long id) {
		return servicio.findById(id);
	}

	// Actualizar solo el estado del incidente
	@PatchMapping("/{id}/estado/{estado}")
	public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @PathVariable byte estado) {
	    servicio.actualizarEstado(id, estado);
	    return ResponseEntity.noContent().build(); // 204 No Content
	}

	
	/* Uso Interno */
	@ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> manejarResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(new ErrorResponse(ex.getStatusCode().value(), ex.getReason()));
    }

    public static class ErrorResponse {
        private int status;
        private String message;

        public ErrorResponse(int status, String message) {
            this.status = status;
            this.message = message;
        }
        public int getStatus() { return status; }
        public String getMessage() { return message; }
    }
}
