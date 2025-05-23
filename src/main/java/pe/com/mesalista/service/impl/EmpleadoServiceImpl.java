package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import pe.com.mesalista.entity.EmpleadoEntity;
import pe.com.mesalista.repository.EmpleadoRepository;
import pe.com.mesalista.service.EmpleadoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmpleadoServiceImpl implements EmpleadoService {

	@Autowired
	private EmpleadoRepository empleadoRepository;
	
	@Override
	public List<EmpleadoEntity> findAll() {
		return empleadoRepository.findAll();
	}
	
	@Override
	public List<EmpleadoEntity> findByNivel(int nivel) {
	    return empleadoRepository.findByNivel(nivel);
	}


	@Override
	public List<EmpleadoEntity> findByEstado(boolean estado) {
		return empleadoRepository.findByEstado(estado);
	}

	@Override
	public EmpleadoEntity findById(Long id) {
		Optional<EmpleadoEntity> usuarioOpt = empleadoRepository.findById(id);
		return usuarioOpt.orElse(null);
	}
	
	@Override
    public List<EmpleadoEntity> findByNombreIgnoreCase(String nombre) {
        return empleadoRepository.findByNombreContainingIgnoreCase(nombre);
    }

	@Override
	public EmpleadoEntity save(EmpleadoEntity usuario) {
		return empleadoRepository.save(usuario);
	}

	@Override
	public EmpleadoEntity update(EmpleadoEntity usuario, Long id) {
	    Optional<EmpleadoEntity> empleadoExistenteOpt = empleadoRepository.findById(id);
	    if (empleadoExistenteOpt.isPresent()) {
	    	
	        EmpleadoEntity empleadoExistente = empleadoExistenteOpt.get();

	        empleadoExistente.setNombre(usuario.getNombre());
	        empleadoExistente.setDocumento(usuario.getDocumento());
	        empleadoExistente.setTelefono(usuario.getTelefono());
	        empleadoExistente.setDireccion(usuario.getDireccion());
	        empleadoExistente.setNivel(usuario.getNivel());
	        empleadoExistente.setEstado(usuario.isEstado());

	        return empleadoRepository.save(empleadoExistente);
	    }
	    return null;
	}



	@Override
	public EmpleadoEntity delete(Long id) {
		empleadoRepository.findById(id).ifPresent(usuario -> {
			usuario.setEstado(false); // Cambiar estado a false (equivalente a deshabilitar)
			empleadoRepository.save(usuario);
		});
		return null;
	}

	@Override
	public EmpleadoEntity enable(Long id) {
		empleadoRepository.findById(id).ifPresent(usuario -> {
			usuario.setEstado(true);
			empleadoRepository.save(usuario);
		});
		return null;
	}
	
	@PersistenceContext
	private EntityManager entityManager;

	@Override
    public Map<String, Object> validarCredenciales(int id, String clave) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_validar_empleado");

        // Registrar parámetros
        query.registerStoredProcedureParameter("p_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_clave", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_es_valido", Boolean.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_mensaje", String.class, ParameterMode.OUT);

        // Asignar valores de entrada
        query.setParameter("p_id", id);
        query.setParameter("p_clave", clave);

        // Ejecutar el SP
        query.execute();

        // Obtener parámetros de salida
        Boolean esValido = (Boolean) query.getOutputParameterValue("p_es_valido");
        String mensaje = (String) query.getOutputParameterValue("p_mensaje");

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("p_es_valido", esValido != null ? esValido : false);
        resultado.put("p_mensaje", mensaje != null ? mensaje : "Error desconocido");

        return resultado;
    }

	@Override
	public Map<String, Object> validarDeliveryCredenciales(int id, String clave) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_validar_delivery");

        // Registrar parámetros
        query.registerStoredProcedureParameter("p_id", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_clave", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_es_valido", Boolean.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_mensaje", String.class, ParameterMode.OUT);

        // Asignar valores de entrada
        query.setParameter("p_id", id);
        query.setParameter("p_clave", clave);

        // Ejecutar el SP
        query.execute();

        // Obtener parámetros de salida
        Boolean esValido = (Boolean) query.getOutputParameterValue("p_es_valido");
        String mensaje = (String) query.getOutputParameterValue("p_mensaje");

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("p_es_valido", esValido != null ? esValido : false);
        resultado.put("p_mensaje", mensaje != null ? mensaje : "Error desconocido");

        return resultado;
	}
	
}
