package pe.com.mesalista.service;

import java.util.List;
import pe.com.mesalista.dto.IncidenteDTO;

public interface IncidenteDTOService {
    
	List<IncidenteDTO> findAll();
	
    List<IncidenteDTO> listarPorEstado(byte estado);

    List<IncidenteDTO> listarPorDelivery(Long deliveryId);

    List<IncidenteDTO> listarPorPedido(Long pedidoId);

    IncidenteDTO findById(Long id);

    List<IncidenteDTO> buscarPorNombreDelivery(String nombre);
}
