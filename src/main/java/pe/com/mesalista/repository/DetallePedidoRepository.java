package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import pe.com.mesalista.entity.DetallePedidoEntity;
import java.util.List;

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
    
    
}
