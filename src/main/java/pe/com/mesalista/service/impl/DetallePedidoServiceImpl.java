package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.DetallePedidoEntity;
import pe.com.mesalista.repository.DetallePedidoRepository;
import pe.com.mesalista.service.DetallePedidoService;

@Service
public class DetallePedidoServiceImpl implements DetallePedidoService {

	@Autowired
	private DetallePedidoRepository detallePedidoRepository;

	@Override
	public List<DetallePedidoEntity> findAll() {
		return detallePedidoRepository.findAll();
	}

	@Override
	public DetallePedidoEntity actualizarComentario(Long detalleId, String nuevoComentario) {
		Optional<DetallePedidoEntity> detalleOpt = detallePedidoRepository.findById(detalleId);
		if (detalleOpt.isPresent()) {
			DetallePedidoEntity detalle = detalleOpt.get();
			detalle.setComentario(nuevoComentario);
			return detallePedidoRepository.save(detalle);
		}
		return null;
	}
	
	
	@Override
	public List<DetallePedidoEntity> findByPedidoId(Long pedidoId) {
		return detallePedidoRepository.findByPedidoId(pedidoId);
	}

	@Override
	public List<DetallePedidoEntity> findByPedidoIdAndProductoId(Long pedidoId, Long productoId) {
		return detallePedidoRepository.findByPedidoIdAndProductoId(pedidoId, productoId);
	}

	@Override
	public List<DetallePedidoEntity> findByEstado(byte estado) {
		return detallePedidoRepository.findByEstado(estado);
	}

	@Override
	public DetallePedidoEntity findById(Long id) {
		Optional<DetallePedidoEntity> detallePedidoOpt = detallePedidoRepository.findById(id);
		return detallePedidoOpt.orElse(null);
	}

	@Override
	public DetallePedidoEntity save(DetallePedidoEntity detallePedido) {
		return detallePedidoRepository.save(detallePedido);
	}

	@Override
	public DetallePedidoEntity update(DetallePedidoEntity detallePedido, Long id) {
		if (detallePedidoRepository.existsById(id)) {
			detallePedido.setId(id);
			return detallePedidoRepository.save(detallePedido);
		}
		return null;
	}

	@Override
	public DetallePedidoEntity delete(Long id) {
		Optional<DetallePedidoEntity> detallePedidoOpt = detallePedidoRepository.findById(id);
		if (detallePedidoOpt.isPresent()) {
			DetallePedidoEntity detallePedido = detallePedidoOpt.get();
			detallePedido.setEstado((byte) 0); // Cambia el estado a 0 (baja lógica)
			detallePedidoRepository.save(detallePedido);
			return detallePedido;
		}
		return null;
	}
	
	@Override
	public List<DetallePedidoEntity> findActivosByPedidoId(Long pedidoId) {
		return detallePedidoRepository.findActivosByPedidoId(pedidoId);
	}

	@Override
	public void eliminarProductosInactivosDelPedido(Integer pedidoId) {
		detallePedidoRepository.eliminarProductosInactivosDelPedido(pedidoId);	
	}
	
}
