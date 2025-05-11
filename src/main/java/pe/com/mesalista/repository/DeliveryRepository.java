package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.DeliveryEntity;

public interface DeliveryRepository extends JpaRepository<DeliveryEntity, Long> {

    // Buscar por estado, como Delivery hereda de Empleado, se busca el estado del empleado
	@Query(value = "SELECT * FROM deliveries d JOIN empleados e ON d.id = e.id WHERE e.estado = :estado", nativeQuery = true)
	List<DeliveryEntity> findByEstado(@Param("estado") boolean estado);

   
    // Buscar por placa con LIKE
    List<DeliveryEntity> findByPlacaContainingIgnoreCase(String placa);
}
