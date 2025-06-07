package pe.com.mesalista.RESTcontroller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.mesalista.service.EmpleadoService;
import pe.com.mesalista.service.ReportesService;
import pe.com.mesalista.util.ExcelExporter;

@RestController
@RequestMapping("/api/reportes")
public class ReportesRestController {

	@Autowired
	private EmpleadoService empleadoService;

	@Autowired
	private ReportesService reportesService;

	@GetMapping("/acceso")
	public Map<String, Object> validarAcceso(@RequestParam Long idEmpleado, @RequestParam String clave) {

		return empleadoService.validarCredenciales(idEmpleado.intValue(), clave);
	}

	/* PARA MOSTRAR GRÁFICOS */
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

	/* PARA EXPORTAR EXCEL */
	@GetMapping("/ventas-por-dia/exportar")
	public ResponseEntity<byte[]> exportarVentasPorDia() throws IOException {
		List<Object[]> data = reportesService.totalVentasPorDia();
		String[] headers = { "Fecha", "Total Ventas" };
		String nombreArchivo = "ventas_por_dia.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/ventas-por-mes/exportar")
	public ResponseEntity<byte[]> exportarVentasPorMes() throws IOException {
		List<Object[]> data = reportesService.totalVentasPorMes();
		String[] headers = { "Mes", "Total Ventas" };
		String nombreArchivo = "ventas_por_mes.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/productos-mas-vendidos/exportar")
	public ResponseEntity<byte[]> exportarProductosMasVendidos() throws IOException {
		List<Object[]> data = reportesService.productosMasVendidos();
		String[] headers = { "Producto", "Cantidad Vendida" };
		String nombreArchivo = "productos_mas_vendidos.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/ticket-promedio-por-dia/exportar")
	public ResponseEntity<byte[]> exportarTicketPromedioPorDia() throws IOException {
		List<Object[]> data = reportesService.ticketPromedioPorDia();
		String[] headers = { "Fecha", "Ticket Promedio" };
		String nombreArchivo = "ticket_promedio_por_dia.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/clientes-frecuentes/exportar")
	public ResponseEntity<byte[]> exportarClientesFrecuentes() throws IOException {
		List<Object[]> data = reportesService.clientesFrecuentes();
		String[] headers = { "Cliente", "Cantidad de Pedidos" };
		String nombreArchivo = "clientes_frecuentes.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/ventas-por-empleado/exportar")
	public ResponseEntity<byte[]> exportarVentasPorEmpleado() throws IOException {
		List<Object[]> data = reportesService.ventasPorEmpleado();
		String[] headers = { "Empleado", "Total Ventas" };
		String nombreArchivo = "ventas_por_empleado.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/entregas-por-delivery/exportar")
	public ResponseEntity<byte[]> exportarEntregasPorDelivery() throws IOException {
		List<Object[]> data = reportesService.entregasPorDelivery();
		String[] headers = { "Repartidor", "Entregas" };
		String nombreArchivo = "entregas_por_delivery.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

	@GetMapping("/pedidos-por-estado/exportar")
	public ResponseEntity<byte[]> exportarPedidosPorEstado() throws IOException {
		List<Object[]> data = reportesService.pedidosPorEstado();
		String[] headers = { "Estado", "Cantidad de Pedidos" };
		String nombreArchivo = "pedidos_por_estado.xlsx";

		byte[] excelBytes = ExcelExporter.exportToExcel(data, headers);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
				.contentType(MediaType.APPLICATION_OCTET_STREAM).body(excelBytes);
	}

}
