package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.DetallePedidoEntity;
import pe.com.mesalista.repository.DetallePedidoRepository;
import pe.com.mesalista.service.DetallePedidoService;
import pe.com.mesalista.util.SystemStatusVerifier;

@Service
public class DetallePedidoServiceImpl implements DetallePedidoService {

	@Autowired
	private DetallePedidoRepository detallePedidoRepository;
	
	@Autowired
    private SystemStatusVerifier sys;

	@Override
	public List<DetallePedidoEntity> findAll() {
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.findAll();
	}

	@Override
	public DetallePedidoEntity actualizarComentario(Long detalleId, String nuevoComentario) {
		sys.checkSystemActiveOrThrow();
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
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.findByPedidoId(pedidoId);
	}

	@Override
	public List<DetallePedidoEntity> findByPedidoIdAndProductoId(Long pedidoId, Long productoId) {
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.findByPedidoIdAndProductoId(pedidoId, productoId);
	}

	@Override
	public List<DetallePedidoEntity> findByEstado(byte estado) {
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.findByEstado(estado);
	}

	@Override
	public DetallePedidoEntity findById(Long id) {
		sys.checkSystemActiveOrThrow();
		Optional<DetallePedidoEntity> detallePedidoOpt = detallePedidoRepository.findById(id);
		return detallePedidoOpt.orElse(null);
	}

	@Override
	public DetallePedidoEntity save(DetallePedidoEntity detallePedido) {
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.save(detallePedido);
	}

	@Override
	public DetallePedidoEntity update(DetallePedidoEntity detallePedido, Long id) {
		sys.checkSystemActiveOrThrow();
		if (detallePedidoRepository.existsById(id)) {
			detallePedido.setId(id);
			return detallePedidoRepository.save(detallePedido);
		}
		return null;
	}

	@Override
	public DetallePedidoEntity delete(Long id) {
		sys.checkSystemActiveOrThrow();
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
		sys.checkSystemActiveOrThrow();
		return detallePedidoRepository.findActivosByPedidoId(pedidoId);
	}

	@Override
	public void eliminarProductosInactivosDelPedido(Integer pedidoId) {
		sys.checkSystemActiveOrThrow();
		detallePedidoRepository.eliminarProductosInactivosDelPedido(pedidoId);	
	}
	
}
