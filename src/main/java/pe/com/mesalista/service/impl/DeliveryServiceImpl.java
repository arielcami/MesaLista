package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.DeliveryEntity;
import pe.com.mesalista.repository.DeliveryRepository;
import pe.com.mesalista.service.DeliveryService;

@Service
public class DeliveryServiceImpl implements DeliveryService {

	@Autowired
	private DeliveryRepository deliveryRepository;

	@Override
	public List<DeliveryEntity> findAll() {
		return deliveryRepository.findAll();
	}

	@Override
	public List<DeliveryEntity> findByPlaca(String placa) {
		return deliveryRepository.findByPlacaContainingIgnoreCase(placa);
	}

	@Override
	public DeliveryEntity findById(Long id) {
		return deliveryRepository.findById(id).orElse(null);
	}

	@Override
	public List<DeliveryEntity> findByEstado(boolean estado) {
		return deliveryRepository.findByEstado(estado); // IMPLEMENTADO CORRECTAMENTE
	}

	@Override
	public DeliveryEntity save(DeliveryEntity delivery) {
		return deliveryRepository.save(delivery);
	}

	@Override
	public DeliveryEntity update(DeliveryEntity delivery, Long id) {
	    Optional<DeliveryEntity> deliveryExistenteOpt = deliveryRepository.findById(id);
	    if (deliveryExistenteOpt.isPresent()) {
	        DeliveryEntity deliveryExistente = deliveryExistenteOpt.get();

	        deliveryExistente.setNombre(delivery.getNombre());
	        deliveryExistente.setDocumento(delivery.getDocumento());
	        deliveryExistente.setTelefono(delivery.getTelefono());
	        deliveryExistente.setDireccion(delivery.getDireccion());
	        deliveryExistente.setNivel(delivery.getNivel());
	        deliveryExistente.setEstado(delivery.isEstado());

	        deliveryExistente.setUnidad(delivery.getUnidad());
	        deliveryExistente.setPlaca(delivery.getPlaca());

	        return deliveryRepository.save(deliveryExistente);
	    }
	    return null;
	}

	@Override
	public DeliveryEntity delete(Long id) {
		return deliveryRepository.findById(id).map(delivery -> {
			delivery.setEstado(false);
			return deliveryRepository.save(delivery);
		}).orElse(null);
	}

	@Override
	public DeliveryEntity enable(Long id) {
		return deliveryRepository.findById(id).map(delivery -> {
			delivery.setEstado(true);
			return deliveryRepository.save(delivery);
		}).orElse(null);
	}
}
