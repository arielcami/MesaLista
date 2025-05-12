package pe.com.mesalista.service;

import java.util.List;
import java.util.Optional;
import pe.com.mesalista.entity.ClienteEntity;


public interface ClienteService {
	
	List <ClienteEntity> findAll();
	    
	List <ClienteEntity> findAllCustom();
	
	List <ClienteEntity> findAllInactive();
	
	List <ClienteEntity> findByNombreContainingIgnoreCase(String nombre);
	
	List <ClienteEntity> findByDocumentoContainingIgnoreCase(String documento);

	ClienteEntity findById(Long id);
	
	ClienteEntity save(ClienteEntity usuario);
	
	ClienteEntity update(ClienteEntity usuario, Long id);
	
	ClienteEntity delete(Long id);
	
	ClienteEntity enable(Long id);
	
	Optional<ClienteEntity> actualizarEstado(Long id, boolean estado);

}
