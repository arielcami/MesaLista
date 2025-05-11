package pe.com.mesalista.service;

import java.util.List;
import pe.com.mesalista.entity.DeliveryEntity;

public interface DeliveryService {

	// Obtener todos los entregadores
	List<DeliveryEntity> findAll();

	// Buscar entregadores por placa (con LIKE)
	List<DeliveryEntity> findByPlaca(String placa);

	// Buscar entregadores por estado (activo=true, inactivo=false)
	List<DeliveryEntity> findByEstado(boolean estado);

	// Obtener entregador por ID
	DeliveryEntity findById(Long id);

	// Guardar un nuevo entregador
	DeliveryEntity save(DeliveryEntity delivery);

	// Actualizar un entregador existente
	DeliveryEntity update(DeliveryEntity delivery, Long id);

	// Eliminar entregador (cambiar estado a inactivo)
	DeliveryEntity delete(Long id);

	// Habilitar entregador (cambiar estado a activo)
	DeliveryEntity enable(Long id);
}
