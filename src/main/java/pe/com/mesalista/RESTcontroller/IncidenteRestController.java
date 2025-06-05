package pe.com.mesalista.RESTcontroller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import pe.com.mesalista.dto.IncidenteDTO;
import pe.com.mesalista.entity.EmpleadoEntity;
import pe.com.mesalista.entity.IncidenteEntity;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.service.EmpleadoService;
import pe.com.mesalista.service.IncidenteDTOService;
import pe.com.mesalista.service.IncidenteService;
import pe.com.mesalista.service.PedidoService;

@RestController
@RequestMapping("/api/incidente")
public class IncidenteRestController {

    @Autowired
    private IncidenteService servicio;

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private IncidenteDTOService dtoService;

    // Devuelve todo
    @GetMapping
    public List<IncidenteDTO> findAll() {
        return dtoService.findAll();
    }
    
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

    // Listar incidentes por estado usando DTO
    @GetMapping("/estado/{estado}")
    public List<IncidenteDTO> listarPorEstadoDTO(@PathVariable byte estado) {
        return dtoService.listarPorEstado(estado);
    }

    // Buscar incidentes por nombre del delivery
    @GetMapping("/delivery/nombre/{nombre}")
    public List<IncidenteDTO> buscarPorNombreDelivery(@PathVariable String nombre) {
        return dtoService.buscarPorNombreDelivery(nombre);
    }

    // Listar incidentes por delivery ID
    @GetMapping("/delivery/{deliveryId}")
    public List<IncidenteDTO> listarPorDelivery(@PathVariable Long deliveryId) {
        return dtoService.listarPorDelivery(deliveryId);
    }

    // Listar incidentes por pedido ID
    @GetMapping("/pedido/{pedidoId}")
    public List<IncidenteDTO> listarPorPedido(@PathVariable Long pedidoId) {
        return dtoService.listarPorPedido(pedidoId);
    }

    // Obtener un incidente por ID
    @GetMapping("/{id}")
    public IncidenteDTO findById(@PathVariable Long id) {
        IncidenteDTO dto = dtoService.findById(id);
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con id " + id);
        }
        return dto;
    }

    // Actualizar solo el estado del incidente
    @PatchMapping("/{id}/estado/{estado}")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @PathVariable byte estado) {
        servicio.actualizarEstado(id, estado);
        return ResponseEntity.noContent().build(); 
    }

    /* Manejo de excepciones interno */
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
