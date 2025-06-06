package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.PedidoEntity;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {
	
	// Listar todos los que esten visibles
	@Query("SELECT p FROM PedidoEntity p WHERE p.visible = true")
	List<PedidoEntity> findAllByVisible();
	
	List<PedidoEntity> findByEstadoPedido(byte estadoPedido);

	List<PedidoEntity> findByCliente_Id(Long clienteId);
	
	// Listar pedidos de acuerdo al ID del delivery y el estado del pedido
	// SI SE REQUIERE LISTAR TODOS INCLUYENDO ANTIGUOS, ELIMINAR "AND p.visible = TRUE"
	@Query("SELECT p FROM PedidoEntity p WHERE p.delivery.id = :deliveryId AND p.estadoPedido = :estadoPedido AND p.visible = TRUE")
	List<PedidoEntity> buscarPorDeliveryYEstado(@Param("deliveryId") Long deliveryId,
			@Param("estadoPedido") Byte estadoPedido);

	// Método para ejecutar el SP 'addProducto'
	@Procedure(procedureName = "addProducto")
	Long agregarProducto(@Param("p_cliente_id") Long clienteId, @Param("p_producto_id") Long productoId,
			@Param("p_cantidad") Integer cantidad, @Param("p_precio_unitario") double precioUnitario);

	// Variante del SP de arriba
	@Procedure(procedureName = "addProductoConPedidoId")
	void agregarProductoConPedidoId(@Param("p_pedido_id") Long pedidoId, @Param("p_producto_id") Long productoId,
			@Param("p_cantidad") Integer cantidad, @Param("p_precio_unitario") double precioUnitario);

	// Método para ejecutar el SP 'confirmarPedido'
	@Procedure(procedureName = "confirmarPedido")
	void confirmarPedido(@Param("p_pedido_id") Long pedidoId, @Param("p_empleado_id") Long empleadoId,
			@Param("p_clave") String claveEmpleado, @Param("p_direccion_entrega") String direccionEntrega);

	// Obtener los pedidos para mostrar en front de Cocina
	// SI SE REQUIERE LISTAR TODOS INCLUYENDO ANTIGUOS, ELIMINAR "AND p.visible = TRUE"
	@Query("SELECT DISTINCT p FROM PedidoEntity p LEFT JOIN FETCH p.detalles WHERE p.estadoPedido = 1 AND p.visible = TRUE ORDER BY p.fechaPedido ASC")
	List<PedidoEntity> findPedidosParaCocina();

	@Transactional
	@Modifying
	@Query("UPDATE PedidoEntity p SET p.estadoPedido = :estado WHERE p.id = :id")
	void setEstadoPedido(@Param("id") Long id, @Param("estado") Byte estado);

	@Modifying
	@Transactional
	@Query("UPDATE PedidoEntity p SET p.estadoPedido = :nuevoEstado WHERE p.id = :pedidoId AND p.delivery.id = :deliveryId")
	void actualizarEstadoSiDeliveryCoincide(@Param("pedidoId") Long pedidoId, @Param("deliveryId") Long deliveryId,
			@Param("nuevoEstado") Byte nuevoEstado);

}
