package pe.com.mesalista.repository;

import java.util.List;

public interface ReportesRepository {
    
    List<Object[]> totalVentasPorDia();

    List<Object[]> totalVentasPorMes();

    List<Object[]> productosMasVendidos();

    List<Object[]> ticketPromedioPorDia();

    List<Object[]> clientesFrecuentes();

    List<Object[]> ventasPorEmpleado();

    List<Object[]> entregasPorDelivery();

    List<Object[]> pedidosPorEstado();

}
