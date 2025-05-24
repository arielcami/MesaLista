package pe.com.mesalista.service;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.*;
import pe.com.mesalista.entity.ClienteEntity;

public interface ClienteService {
	
	List<ClienteEntity> findAll();

	List<ClienteEntity> findByNombreContainingIgnoreCase(String nombre);

	List<ClienteEntity> findByDocumentoContainingIgnoreCase(String nombre);

	ClienteEntity findByDocumento(String documento);

	ClienteEntity findById(Long id);

	ClienteEntity save(ClienteEntity usuario);

	ClienteEntity update(ClienteEntity usuario, Long id);

	// SP
	Map<String, Object> addClienteSP(String nombre, String telefono, String documento, String direccion);

	// Paginación
	Page<ClienteEntity> findAllPaginado(Pageable pageable);
	Page<ClienteEntity> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}
