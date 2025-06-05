package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.dto.IncidenteDTO;
import pe.com.mesalista.entity.IncidenteEntity;
import pe.com.mesalista.service.IncidenteDTOService;
import pe.com.mesalista.service.IncidenteService;

@Service
public class IncidenteDTOServiceImpl implements IncidenteDTOService {

    @Autowired
    private IncidenteService incidenteService;

    @Override
    public List<IncidenteDTO> findAll() {
        List<IncidenteEntity> entidades = incidenteService.findAll();
        return entidades.stream().map(this::convertirADTO).collect(Collectors.toList());
    }
    
    
    @Override
    public List<IncidenteDTO> listarPorEstado(byte estado) {
        List<IncidenteEntity> entidades = incidenteService.listarPorEstado(estado);
        return entidades.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public List<IncidenteDTO> buscarPorNombreDelivery(String nombre) {
        List<IncidenteEntity> entidades = incidenteService.buscarPorNombreDelivery(nombre);
        return entidades.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public List<IncidenteDTO> listarPorDelivery(Long deliveryId) {
        List<IncidenteEntity> entidades = incidenteService.listarPorDelivery(deliveryId);
        return entidades.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public List<IncidenteDTO> listarPorPedido(Long pedidoId) {
        List<IncidenteEntity> entidades = incidenteService.listarPorPedido(pedidoId);
        return entidades.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public IncidenteDTO findById(Long id) {
        return incidenteService.findById(id).map(this::convertirADTO).orElse(null);
    }

    private IncidenteDTO convertirADTO(IncidenteEntity entidad) {
        IncidenteDTO dto = new IncidenteDTO();
        dto.setId(entidad.getId());
        dto.setPedidoId(entidad.getPedido().getId());
        dto.setDeliveryId(entidad.getDelivery().getId());
        dto.setUbicacion(entidad.getUbicacion());
        dto.setIncidente(entidad.getIncidente());
        dto.setEstado(entidad.getEstado());
        dto.setFecha(entidad.getFecha());
        dto.setNombreDelivery(entidad.getDelivery().getNombre());
        return dto;
    }
}
