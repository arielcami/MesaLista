package pe.com.mesalista.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
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

	@PersistenceContext
	private EntityManager entityManager;
	
	@Override
    public Map<String, Object> validarCredenciales(int id, String clave) {
		
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_validar_empleado");
		
		// Registrar parámetros
        query.registerStoredProcedureParameter("p_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_clave", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_es_valido", Boolean.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_mensaje", String.class, ParameterMode.OUT);
        
        // Asignar valores de entrada
        query.setParameter("p_id", id);
        query.setParameter("p_clave", clave);

        // Ejecutar el SP
        query.execute();

        // Obtener parámetros de salida
        Boolean esValido = (Boolean) query.getOutputParameterValue("p_es_valido");
        String mensaje = (String) query.getOutputParameterValue("p_mensaje");

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("p_es_valido", esValido != null ? esValido : false);
        resultado.put("p_mensaje", mensaje != null ? mensaje : "Error desconocido");

        return resultado;
	}
}
