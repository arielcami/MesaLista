package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.ClienteEntity;

public interface ClienteRepository extends JpaRepository<ClienteEntity, Long>{
	
	List <ClienteEntity> findByNombreContainingIgnoreCase(String nombre);
	List<ClienteEntity> findByDocumentoContainingIgnoreCase(String documento);

}
