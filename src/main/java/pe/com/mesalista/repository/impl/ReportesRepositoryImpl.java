package pe.com.mesalista.repository.impl;

import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import pe.com.mesalista.repository.ReportesRepository;

@Repository
@Transactional(readOnly = true)
public class ReportesRepositoryImpl implements ReportesRepository {

	@PersistenceContext
	private EntityManager em;

	@Override
	public List<Object[]> totalVentasPorDia() {
		String jpql = "SELECT DATE(p.fechaPedido), SUM(p.total) "
					+ "FROM PedidoEntity p "
					+ "WHERE p.estadoPedido = 4 "
					+ "GROUP BY DATE(p.fechaPedido) "
					+ "ORDER BY DATE(p.fechaPedido) DESC";
		return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> totalVentasPorMes() {
		String jpql = "SELECT FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m'), SUM(p.total) "
					+ "FROM PedidoEntity p "
					+ "WHERE p.estadoPedido = 4 "
					+ "GROUP BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m') "
					+ "ORDER BY 1 DESC";
		return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> productosMasVendidos() {
		String jpql = "SELECT d.producto.nombre, SUM(d.cantidad) "
					+ "FROM DetallePedidoEntity d JOIN d.pedido p "
					+ "WHERE p.estadoPedido = 4 "
					+ "GROUP BY d.producto.id, d.producto.nombre "
					+ "ORDER BY SUM(d.cantidad) DESC";
		return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> ticketPromedioPorDia() {
		String jpql = "SELECT DATE(p.fechaPedido), AVG(p.total) "
					+ "FROM PedidoEntity p "
					+ "WHERE p.estadoPedido = 4 "
					+ "GROUP BY DATE(p.fechaPedido) "
					+ "ORDER BY DATE(p.fechaPedido) DESC";
		return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> clientesFrecuentes() {
		String jpql = "SELECT p.cliente.nombre, COUNT(p.id), SUM(p.total) "
					+ "FROM PedidoEntity p "
					+ "WHERE p.estadoPedido = 4 "
					+ "GROUP BY p.cliente.id, p.cliente.nombre "
					+ "ORDER BY COUNT(p.id) DESC, SUM(p.total) DESC";
		return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> ventasPorEmpleado() {
	    String jpql = "SELECT p.empleado.nombre, SUM(p.total) "
	                + "FROM PedidoEntity p "
	                + "WHERE p.estadoPedido = 4 "
	                + "AND FUNCTION('YEAR', p.fechaPedido) = FUNCTION('YEAR', CURRENT_DATE) "
	                + "AND FUNCTION('MONTH', p.fechaPedido) = FUNCTION('MONTH', CURRENT_DATE) "
	                + "GROUP BY p.empleado.id, p.empleado.nombre "
	                + "ORDER BY SUM(p.total) DESC";
	    return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> entregasPorDelivery() {
	    String jpql = "SELECT d.nombre, COUNT(p.id) "
	                + "FROM PedidoEntity p JOIN DeliveryEntity d ON p.delivery.id = d.id "
	                + "WHERE p.delivery IS NOT NULL "
	                + "AND p.estadoPedido = 4 "
	                + "AND FUNCTION('YEAR', p.fechaPedido) = FUNCTION('YEAR', CURRENT_DATE) "
	                + "AND FUNCTION('MONTH', p.fechaPedido) = FUNCTION('MONTH', CURRENT_DATE) "
	                + "GROUP BY d.id, d.nombre "
	                + "ORDER BY COUNT(p.id) DESC";
	    return em.createQuery(jpql, Object[].class).getResultList();
	}

	@Override
	public List<Object[]> pedidosPorEstado() {
		// Aquí no filtramos por estado porque es reporte de conteo por estados
		String jpql = "SELECT p.estadoPedido, COUNT(p.id) "
					+ "FROM PedidoEntity p "
					+ "GROUP BY p.estadoPedido "
					+ "ORDER BY p.estadoPedido";
		return em.createQuery(jpql, Object[].class).getResultList();
	}
}
