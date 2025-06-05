package pe.com.mesalista.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.mesalista.entity.IncidenteEntity;

@Repository
public interface IncidenteRepository extends JpaRepository<IncidenteEntity, Long> {

    List<IncidenteEntity> findByEstado(byte estado);

    List<IncidenteEntity> findByDeliveryId(Long deliveryId);

    List<IncidenteEntity> findByPedidoId(Long pedidoId);

    Optional<IncidenteEntity> findById(Long incidenteId);
    
    List<IncidenteEntity> findByDeliveryIdAndFechaAfter(Long deliveryId, LocalDateTime fecha);
    
    boolean existsByDeliveryIdAndFechaAfter(Long deliveryId, LocalDateTime fecha);
    
    List<IncidenteEntity> findByDeliveryNombreContainingIgnoreCase(String nombre);

}