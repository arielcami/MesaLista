package pe.com.mesalista.RESTcontroller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.mesalista.dto.AsignacionRequest;
import pe.com.mesalista.dto.MovimientoMesaRequest;
import pe.com.mesalista.entity.MesaEntity;
import pe.com.mesalista.service.EmpleadoService;
import pe.com.mesalista.service.MesaService;

@RestController
@RequestMapping("/api/mesa")
public class MesaRestController {

	@Autowired
	private MesaService mesaService;

	@Autowired
	private EmpleadoService empleadoService;

	@GetMapping("/todas")
	public List<MesaEntity> listarTodasLasMesas() {
		return mesaService.listarTodasLasMesas();
	}

	@PostMapping("/crear")
	public ResponseEntity<MesaEntity> crearMesa(@RequestBody MesaEntity nuevaMesa) {
		MesaEntity creada = mesaService.crearMesa(nuevaMesa);
		return ResponseEntity.status(HttpStatus.CREATED).body(creada);
	}

	@GetMapping
	public List<MesaEntity> listarMesasPorEstado(@RequestParam int estado) {
		return mesaService.listarMesasPorEstado(estado);
	}

	@PatchMapping("/estado/{id}/{estado}/")
	public void actualizarEstadoMesa(@PathVariable int id, @PathVariable int estado, @RequestParam Integer clienteId) {
		mesaService.actualizarEstadoMesa(id, estado, clienteId);
	}

	@GetMapping("/buscar-por-cliente/{clienteId}")
	public MesaEntity buscarMesaPorCliente(@PathVariable Integer clienteId) {
		return mesaService.buscarPorClienteId(clienteId).orElseThrow(
				() -> new RuntimeException("No se encontró una mesa para el cliente con ID: " + clienteId));
	}

	@PutMapping("/asignar")
	public ResponseEntity<String> asignarClienteYEmpleado(@RequestBody AsignacionRequest request) {
		Map<String, Object> resultado = empleadoService.validarMeseroCredenciales(request.getEmpleadoId(),
				request.getClaveEmpleado());

		boolean esValido = (Boolean) resultado.get("p_es_valido");
		String mensaje = (String) resultado.get("p_mensaje");

		if (!esValido) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mensaje);
		}

		mesaService.asignarClienteYEmpleado(request.getMesaId(), request.getClienteId(), request.getEmpleadoId());

		return ResponseEntity.ok("Cliente y empleado asignados correctamente");
	}

	@PatchMapping("/desalojar/{mesaId}")
	public ResponseEntity<String> desalojarMesa(@PathVariable Integer mesaId) {
		mesaService.desalojarMesa(mesaId);
		return ResponseEntity.ok("Mesa desalojada correctamente");
	}

	@PatchMapping("/cerrar/{mesaId}")
	public ResponseEntity<String> cerrarMesa(@PathVariable Integer mesaId) {
		mesaService.clausurarMesa(mesaId);
		return ResponseEntity.ok("Mesa cerrada correctamente");
	}

	@PatchMapping("/aperturar/{mesaId}")
	public ResponseEntity<String> habilitarMesa(@PathVariable Integer mesaId) {
		mesaService.habilitarMesa(mesaId);
		return ResponseEntity.ok("Mesa habilitada correctamente");
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<String> eliminarMesa(@PathVariable Integer id) {
		try {
			mesaService.eliminarMesaPorId(id);
			return ResponseEntity.ok("Mesa eliminada correctamente");
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		}
	}

	@PatchMapping("/movercliente")
	public ResponseEntity<String> moverClienteDeMesa(@RequestBody MovimientoMesaRequest request) {
		try {
			mesaService.moverClienteDeMesa(request.getMesaOrigenId(), request.getClienteId(),
					request.getMesaDestinoId());
			return ResponseEntity.ok("Cliente movido exitosamente.");
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al mover cliente de mesa: " + ex.getMessage());
		}
	}

}
