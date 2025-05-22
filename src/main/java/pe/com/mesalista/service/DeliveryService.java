package pe.com.mesalista.service;

import java.util.List;
import java.util.Map;
import pe.com.mesalista.entity.DeliveryEntity;

public interface DeliveryService {

	List<DeliveryEntity> findAll();
	List<DeliveryEntity> findByPlaca(String placa);
	List<DeliveryEntity> findByEstado(boolean estado);
	DeliveryEntity findById(Long id);
	DeliveryEntity save(DeliveryEntity delivery);
	DeliveryEntity update(DeliveryEntity delivery, Long id);
	DeliveryEntity delete(Long id);
	DeliveryEntity enable(Long id);
	
	Map<String, Object> validarCredenciales(int id, String clave);
}
