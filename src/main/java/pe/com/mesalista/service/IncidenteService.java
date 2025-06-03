package pe.com.mesalista.service;

import java.util.List;
import java.util.Optional;
import pe.com.mesalista.entity.IncidenteEntity;

public interface IncidenteService {

    IncidenteEntity registrar(IncidenteEntity incidente);

    List<IncidenteEntity> listarPorEstado(byte estado);

    List<IncidenteEntity> listarPorDelivery(Long deliveryId);

    List<IncidenteEntity> listarPorPedido(Long pedidoId);
    
    Optional<IncidenteEntity> findById(Long incidenteId);
	
    void actualizarEstado(Long incidenteId, byte nuevoEstado);

}