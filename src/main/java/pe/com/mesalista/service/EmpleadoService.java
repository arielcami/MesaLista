package pe.com.mesalista.service;

import java.util.List;
import java.util.Map;
import pe.com.mesalista.entity.EmpleadoEntity;

public interface EmpleadoService {

	List<EmpleadoEntity> findAll();

	EmpleadoEntity findById(Long id);

	EmpleadoEntity save(EmpleadoEntity usuario);

	EmpleadoEntity update(EmpleadoEntity usuario, Long id);

	EmpleadoEntity delete(Long id);

	EmpleadoEntity enable(Long id);

	List<EmpleadoEntity> findByEstado(boolean estado);
	
	List<EmpleadoEntity> findByNombreIgnoreCase(String nombre);
	
	List<EmpleadoEntity> findByNivel(int nivel);
	
	Map<String, Object> validarCredenciales(int id, String clave);
	
	Map<String, Object> validarDeliveryCredenciales(int id, String clave);

}
