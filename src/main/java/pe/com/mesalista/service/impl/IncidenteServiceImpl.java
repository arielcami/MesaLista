package pe.com.mesalista.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pe.com.mesalista.entity.IncidenteEntity;
import pe.com.mesalista.repository.IncidenteRepository;
import pe.com.mesalista.service.IncidenteService;

@Service
public class IncidenteServiceImpl implements IncidenteService {

	@Autowired
	private IncidenteRepository incidenteRepository;

	@Override
	public IncidenteEntity registrar(IncidenteEntity incidente) {
	    Long deliveryId = incidente.getDelivery().getId();
	    LocalDateTime tiempoLimite = LocalDateTime.now().minusMinutes(15);

	    if (incidenteRepository.existsByDeliveryIdAndFechaAfter(deliveryId, tiempoLimite)) {
	        throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Solo puede registrar un incidente cada 15 minutos.");
	    }

	    return incidenteRepository.save(incidente);
	}

	@Override
	public List<IncidenteEntity> listarPorEstado(byte estado) {
		return incidenteRepository.findByEstado(estado);
	}

	@Override
	public List<IncidenteEntity> listarPorDelivery(Long deliveryId) {
		return incidenteRepository.findByDeliveryId(deliveryId);
	}

	@Override
	public List<IncidenteEntity> listarPorPedido(Long pedidoId) {
		return incidenteRepository.findByPedidoId(pedidoId);
	}

	@Override
	public void actualizarEstado(Long incidenteId, byte nuevoEstado) {
		incidenteRepository.findById(incidenteId).ifPresent(incidente -> {
			incidente.setEstado(nuevoEstado);
			incidenteRepository.save(incidente);
		});
	}

	@Override
	public Optional<IncidenteEntity> findById(Long incidenteId) {
		return incidenteRepository.findById(incidenteId);
	}

}
