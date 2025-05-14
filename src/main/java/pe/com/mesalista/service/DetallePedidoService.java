package pe.com.mesalista.service;

import pe.com.mesalista.entity.DetallePedidoEntity;

import java.util.List;

public interface DetallePedidoService {

	// Buscar todos los detalles de pedidos
	List<DetallePedidoEntity> findAll();

	// Buscar detalles de un pedido específico por el ID del pedido
	List<DetallePedidoEntity> findByPedidoId(Long pedidoId);

	// Buscar detalles de un pedido específico por el ID del pedido y el ID del
	// producto
	List<DetallePedidoEntity> findByPedidoIdAndProductoId(Long pedidoId, Long productoId);

	// Buscar detalles de pedidos por el estado
	List<DetallePedidoEntity> findByEstado(byte estado);

	// Buscar detalle de pedido por ID
	DetallePedidoEntity findById(Long id);

	// Guardar un nuevo detalle de pedido
	DetallePedidoEntity save(DetallePedidoEntity detallePedido);

	// Actualizar un detalle de pedido existente
	DetallePedidoEntity update(DetallePedidoEntity detallePedido, Long id);

	// Eliminar un detalle de pedido
	DetallePedidoEntity delete(Long id);
	
	// Buscar todos los detalles activos (estado = 1) de un pedido específico
	List<DetallePedidoEntity> findActivosByPedidoId(Long pedidoId);

	
}
