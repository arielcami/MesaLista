package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.DeliveryEntity;
import pe.com.mesalista.entity.PedidoEntity;
import pe.com.mesalista.repository.DeliveryRepository;
import pe.com.mesalista.repository.PedidoRepository;
import pe.com.mesalista.service.PedidoService;
import pe.com.mesalista.util.SystemStatusVerifier;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private SystemStatusVerifier sys;

    
    
    @Override
    public List<PedidoEntity> findAll() {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.findAll();
    }
    
    @Override
	public List<PedidoEntity> findAllByVisible() {
    	sys.checkSystemActiveOrThrow();
    	return pedidoRepository.findAllByVisible();
	}
    
    @Override
    public List<PedidoEntity> obtenerPedidosIncompletos() {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.findPedidosIncompletos();
    }    

    @Override
    public List<PedidoEntity> findByEstadoPedido(Byte estadoPedido) {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.findByEstadoPedido(estadoPedido);
    }

    @Override
    public List<PedidoEntity> findByClienteId(Long clienteId) {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.findByCliente_Id(clienteId);
    }
    
    @Override
    public List<PedidoEntity> obtenerPedidosPorDeliveryYEstado(Long deliveryId, Byte estadoPedido) {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.buscarPorDeliveryYEstado(deliveryId, estadoPedido);
    }

    @Override
    public PedidoEntity findById(Long id) {
    	sys.checkSystemActiveOrThrow();
        Optional<PedidoEntity> pedidoOpt = pedidoRepository.findById(id);
        return pedidoOpt.orElse(null);
    }

    public PedidoEntity save(PedidoEntity pedido) {
        sys.checkSystemActiveOrThrow();
        return pedidoRepository.save(pedido);
    }

    @Override
    public PedidoEntity update(PedidoEntity pedido, Long id) {
        sys.checkSystemActiveOrThrow();
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
    	sys.checkSystemActiveOrThrow();
        PedidoEntity pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        DeliveryEntity delivery = deliveryRepository.findById(deliveryId).orElseThrow();
        pedido.setDelivery(delivery);
        return pedidoRepository.save(pedido);
    }
    	
    // SP
    @Override
    public void confirmarPedido(Long pedidoId, Long empleadoId, String clave, String direccionEntrega, boolean paraLlevar, Integer mesaId) {
        sys.checkSystemActiveOrThrow();
        if (direccionEntrega == null || direccionEntrega.trim().isEmpty()) {
            direccionEntrega = null;
        }
        pedidoRepository.confirmarPedido(pedidoId, empleadoId, clave, direccionEntrega, paraLlevar, mesaId);
    }


    @Override
    public List<PedidoEntity> findPedidosParaCocina() {
    	sys.checkSystemActiveOrThrow();
        return pedidoRepository.findPedidosParaCocina();
    }
    
    @Override
    @Transactional
    public void marcarPedidoEstado(Long pedidoId, Byte estado) {
    	sys.checkSystemActiveOrThrow();
    	
        PedidoEntity pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Caso 1: Para llevar -> aceptar cualquier estado
        if (pedido.isParaLlevar()) {
            pedidoRepository.setEstadoPedido(pedidoId, estado);
            return;
        }

        // Caso 2: Para consumo local
        if (pedido.getEstadoPedido() == 1) {
            // Está en cocina -> forzar a entregado
            pedidoRepository.setEstadoPedido(pedidoId, (byte) 4);
        } else {
            // Ya no está en cocina -> permitir cambio libre de estado
            pedidoRepository.setEstadoPedido(pedidoId, estado);
        }
    }
    
    @Override
    @Transactional
    public void actualizarEstadoSiDeliveryCoincide(Long pedidoId, Long deliveryId, Byte nuevoEstado) {
    	sys.checkSystemActiveOrThrow();
        pedidoRepository.actualizarEstadoSiDeliveryCoincide(pedidoId, deliveryId, nuevoEstado);
    }
    
    
    @Override
    public void limpiarBasuraPedido(Integer pedidoId) {
    	sys.checkSystemActiveOrThrow();
        pedidoRepository.limpiarBasuraPedido(pedidoId);
    }
    
    
}
