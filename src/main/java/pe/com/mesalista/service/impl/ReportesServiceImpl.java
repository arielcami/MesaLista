package pe.com.mesalista.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import pe.com.mesalista.repository.ReportesRepository;
import pe.com.mesalista.service.ReportesService;

@Service
public class ReportesServiceImpl implements ReportesService {

	private final ReportesRepository reportesRepository;

	public ReportesServiceImpl(ReportesRepository reportesRepository) {
		this.reportesRepository = reportesRepository;
	}

	@Override
	public List<Object[]> totalVentasPorDia() {
		return reportesRepository.totalVentasPorDia();
	}

	@Override
	public List<Object[]> totalVentasPorMes() {
		return reportesRepository.totalVentasPorMes();
	}

	@Override
	public List<Object[]> productosMasVendidos() {
		return reportesRepository.productosMasVendidos();
	}

	@Override
	public List<Object[]> ticketPromedioPorDia() {
		return reportesRepository.ticketPromedioPorDia();
	}

	@Override
	public List<Object[]> clientesFrecuentes() {
		return reportesRepository.clientesFrecuentes();
	}

	@Override
	public List<Object[]> ventasPorEmpleado() {
		return reportesRepository.ventasPorEmpleado();
	}

	@Override
	public List<Object[]> entregasPorDelivery() {
		return reportesRepository.entregasPorDelivery();
	}

	@Override
	public List<Object[]> pedidosPorEstado() {
		return reportesRepository.pedidosPorEstado();
	}
}
