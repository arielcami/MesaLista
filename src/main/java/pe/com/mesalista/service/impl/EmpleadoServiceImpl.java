package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.EmpleadoEntity;
import pe.com.mesalista.repository.EmpleadoRepository;
import pe.com.mesalista.service.EmpleadoService;
import java.util.List;
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
}
