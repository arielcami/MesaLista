package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.DetallePedidoEntity;

public interface DetallePedidoRepository extends JpaRepository<DetallePedidoEntity, Long> {

    List<DetallePedidoEntity> findByPedidoId(Long pedidoId);

    List<DetallePedidoEntity> findByPedidoIdAndProductoId(Long pedidoId, Long productoId);
    
    // Lista todos los detalles de un pedido específico con estado activo (1)
    @Query("SELECT d FROM DetallePedidoEntity d WHERE d.pedido.id = :pedidoId AND d.estado = 1")
    List<DetallePedidoEntity> findActivosByPedidoId(@Param("pedidoId") Long pedidoId);


    List<DetallePedidoEntity> findByEstado(byte estado);
    
    @Procedure(procedureName = "adjustCantidadProducto")
    void ajustarCantidadProducto(// pedidoId, productoId, delta
        @Param("p_pedido_id") Long pedidoId,
        @Param("p_producto_id") Long productoId,
        @Param("p_delta") Integer delta
    );
    	
    @Modifying
    @Transactional
    @Query("DELETE FROM DetallePedidoEntity d WHERE d.pedido.id = :pedidoId AND d.cantidad = 0")
    void eliminarProductosInactivosDelPedido(@Param("pedidoId") Integer pedidoId);
    
}
