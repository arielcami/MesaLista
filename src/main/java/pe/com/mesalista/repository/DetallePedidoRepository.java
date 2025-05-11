package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.DetallePedidoEntity;
import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedidoEntity, Long> {

	// Buscar detalles de un pedido específico por su id
	List<DetallePedidoEntity> findByPedidoId(Long pedidoId);

	// Buscar detalles de un pedido específico, incluyendo información del producto
	List<DetallePedidoEntity> findByPedidoIdAndProductoId(Long pedidoId, Long productoId);

	// Buscar detalles de pedido por estado
	List<DetallePedidoEntity> findByEstado(byte estado);
}
