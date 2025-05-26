package pe.com.mesalista.service;

import java.util.List;
import pe.com.mesalista.entity.PedidoEntity;

public interface PedidoService {

    List<PedidoEntity> findAll();

    List<PedidoEntity> findByEstadoPedido(Byte estadoPedido);

    List<PedidoEntity> findByClienteId(Long clienteId);

    PedidoEntity findById(Long id);

    PedidoEntity save(PedidoEntity pedido);

    PedidoEntity update(PedidoEntity pedido, Long id);

    PedidoEntity delete(Long id);

    PedidoEntity asignarDelivery(Long pedidoId, Long deliveryId);
    
    void confirmarPedido(Long pedidoId, Long empleadoId, String clave, String direccionEntrega);
    
    List<PedidoEntity> findPedidosParaCocina();
    
    void marcarPedidoEstado(Long pedidoId, Byte estado);



}
