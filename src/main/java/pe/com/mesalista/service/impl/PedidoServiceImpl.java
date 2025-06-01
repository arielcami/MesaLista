package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.DeliveryEntity;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.repository.DeliveryRepository;
import pe.com.mesalista.repository.PedidoRepository;
import pe.com.mesalista.service.PedidoService;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    
    @Override
    public List<PedidoEntity> findAll() {
        return pedidoRepository.findAll();
    }
    
    @Override
	public List<PedidoEntity> findAllByVisible() {
    	return pedidoRepository.findAllByVisible();
	}

    @Override
    public List<PedidoEntity> findByEstadoPedido(Byte estadoPedido) {
        return pedidoRepository.findByEstadoPedido(estadoPedido);
    }

    @Override
    public List<PedidoEntity> findByClienteId(Long clienteId) {
        return pedidoRepository.findByCliente_Id(clienteId);
    }
    
    @Override
    public List<PedidoEntity> obtenerPedidosPorDeliveryYEstado(Long deliveryId, Byte estadoPedido) {
        return pedidoRepository.buscarPorDeliveryYEstado(deliveryId, estadoPedido);
    }

    @Override
    public PedidoEntity findById(Long id) {
        Optional<PedidoEntity> pedidoOpt = pedidoRepository.findById(id);
        return pedidoOpt.orElse(null);
    }

    @Override
    public PedidoEntity save(PedidoEntity pedido) {
        return pedidoRepository.save(pedido);
    }

    @Override
    public PedidoEntity update(PedidoEntity pedido, Long id) {
        if (pedidoRepository.existsById(id)) {
            pedido.setId(id);
            return pedidoRepository.save(pedido);
        }
        return null;
    }

    @Override
    public PedidoEntity delete(Long id) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstadoPedido((byte) 0);
            return pedidoRepository.save(pedido);
        }).orElse(null);
    }

    @Override
    public PedidoEntity asignarDelivery(Long pedidoId, Long deliveryId) {
        PedidoEntity pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        DeliveryEntity delivery = deliveryRepository.findById(deliveryId).orElseThrow();
        pedido.setDelivery(delivery);
        return pedidoRepository.save(pedido);
    }
    	
    // SP
    @Override
    public void confirmarPedido(Long pedidoId, Long empleadoId, String clave, String direccionEntrega) {
        if (direccionEntrega == null || direccionEntrega.trim().isEmpty()) {
            direccionEntrega = null;
        }
        pedidoRepository.confirmarPedido(pedidoId, empleadoId, clave, direccionEntrega);
    }


    @Override
    public List<PedidoEntity> findPedidosParaCocina() {
        return pedidoRepository.findPedidosParaCocina();
    }
    
    @Override
    @Transactional
    public void marcarPedidoEstado(Long pedidoId, Byte estado) {
        pedidoRepository.setEstadoPedido(pedidoId, estado);
    }
    
    @Override
    @Transactional
    public void actualizarEstadoSiDeliveryCoincide(Long pedidoId, Long deliveryId, Byte nuevoEstado) {
        pedidoRepository.actualizarEstadoSiDeliveryCoincide(pedidoId, deliveryId, nuevoEstado);
    }
}
