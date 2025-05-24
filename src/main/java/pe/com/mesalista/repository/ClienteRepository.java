package pe.com.mesalista.repository;

import java.util.List;
import java.util.Map;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import pe.com.mesalista.entity.ClienteEntity;

public interface ClienteRepository extends JpaRepository<ClienteEntity, Long>{
	
	List <ClienteEntity> findByNombreContainingIgnoreCase(String nombre);
	
	// Tipo LISTA
	List <ClienteEntity> findByDocumentoContainingIgnoreCase(String documento);
	
	// Tipo ClienteEntity = solo encuentra 1 con el documento completo
	ClienteEntity findByDocumento(String documento);
	
    @Procedure(procedureName = "addCliente")
    Map<String, Object> addCliente(
        @Param("cliente_nombre") String nombre,
        @Param("cliente_telefono") String telefono,
        @Param("cliente_documento") String documento,
        @Param("cliente_direccion") String direccion
    );
	
}
