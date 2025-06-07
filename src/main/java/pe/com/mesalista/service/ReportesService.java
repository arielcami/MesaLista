package pe.com.mesalista.service;

import java.util.List;

public interface ReportesService {

    List<Object[]> totalVentasPorDia();

    List<Object[]> totalVentasPorMes();

    List<Object[]> productosMasVendidos();

    List<Object[]> ticketPromedioPorDia();

    List<Object[]> clientesFrecuentes();

    List<Object[]> ventasPorEmpleado();

    List<Object[]> entregasPorDelivery();

    List<Object[]> pedidosPorEstado();

}
