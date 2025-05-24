package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import pe.com.mesalista.entity.PedidoEntity;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {

    List<PedidoEntity> findByEstadoPedido(byte estadoPedido);

    List<PedidoEntity> findByCliente_Id(Long clienteId);

    List<PedidoEntity> findByDelivery_Id(Long deliveryId);
    
    // Método para ejecutar el SP 'addProducto'
    @Procedure(procedureName = "addProducto")
    Long agregarProducto(
        @Param("p_cliente_id") Long clienteId,
        @Param("p_producto_id") Long productoId,
        @Param("p_cantidad") Integer cantidad,
        @Param("p_precio_unitario") double precioUnitario
    );
    
    
    // Método para ejecutar el SP 'confirmarPedido'
    @Procedure(procedureName = "confirmarPedido")
    void confirmarPedido(
        @Param("p_pedido_id") Long pedidoId,
        @Param("p_empleado_id") Long empleadoId,
        @Param("p_clave") String claveEmpleado,
        @Param("p_direccion_entrega") String direccionEntrega
    );
        
    @Query("SELECT DISTINCT p FROM PedidoEntity p LEFT JOIN FETCH p.detalles WHERE p.estadoPedido = 1 ORDER BY p.fechaPedido ASC")
    List<PedidoEntity> findPedidosParaCocina();


}
