package pe.com.mesalista.RESTcontroller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.mesalista.service.EmpleadoService;
import pe.com.mesalista.service.ReportesService;

@RestController
@RequestMapping("/api/reportes")
public class ReportesRestController {

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private ReportesService reportesService;

    @GetMapping("/acceso")
    public Map<String, Object> validarAcceso(
        @RequestParam Long idEmpleado,
        @RequestParam String clave) {

        return empleadoService.validarCredenciales(idEmpleado.intValue(), clave);
    }

    @GetMapping("/ventas-por-dia")
    public List<Object[]> totalVentasPorDia() {
        return reportesService.totalVentasPorDia();
    }

    @GetMapping("/ventas-por-mes")
    public List<Object[]> totalVentasPorMes() {
        return reportesService.totalVentasPorMes();
    }

    @GetMapping("/productos-mas-vendidos")
    public List<Object[]> productosMasVendidos() {
        return reportesService.productosMasVendidos();
    }

    @GetMapping("/ticket-promedio-por-dia")
    public List<Object[]> ticketPromedioPorDia() {
        return reportesService.ticketPromedioPorDia();
    }

    @GetMapping("/clientes-frecuentes")
    public List<Object[]> clientesFrecuentes() {
        return reportesService.clientesFrecuentes();
    }

    @GetMapping("/ventas-por-empleado")
    public List<Object[]> ventasPorEmpleado() {
        return reportesService.ventasPorEmpleado();
    }

    @GetMapping("/entregas-por-delivery")
    public List<Object[]> entregasPorDelivery() {
        return reportesService.entregasPorDelivery();
    }

    @GetMapping("/pedidos-por-estado")
    public List<Object[]> pedidosPorEstado() {
        return reportesService.pedidosPorEstado();
    }
}
