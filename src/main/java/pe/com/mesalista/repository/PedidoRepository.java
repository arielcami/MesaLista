package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import pe.com.mesalista.entity.PedidoEntity;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {

	List<PedidoEntity> findByEstadoPedido(byte estadoPedido);

	List<PedidoEntity> findByCliente_Id(Long clienteId);
	
	List<PedidoEntity> findByDelivery_Id(Long deliveryId);
	
	@Procedure(procedureName = "addProducto")
    void agregarProductoAlPedido(
        @Param("p_cliente_id") Long clienteId,
        @Param("p_empleado_id") Long empleadoId,
        @Param("p_producto_id") Long productoId,
        @Param("p_cantidad") Integer cantidad,
        @Param("p_direccion_entrega") String direccionEntrega
    );
	
	
}
