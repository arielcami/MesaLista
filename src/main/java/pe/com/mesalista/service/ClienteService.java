package pe.com.mesalista.service;

import java.util.List;
import pe.com.mesalista.entity.ClienteEntity;


public interface ClienteService {
	
	List <ClienteEntity> findAll();
	    	
	List <ClienteEntity> findByNombreContainingIgnoreCase(String nombre);
	
	List <ClienteEntity> findByDocumentoContainingIgnoreCase(String documento);

	ClienteEntity findById(Long id);
	
	ClienteEntity save(ClienteEntity usuario);
	
	ClienteEntity update(ClienteEntity usuario, Long id);
		
}
