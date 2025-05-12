package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.repository.ClienteRepository;
import pe.com.mesalista.service.ClienteService;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteServiceImpl implements ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public List<ClienteEntity> findAll() {
        return clienteRepository.findAll();
    }

    @Override
    public List<ClienteEntity> findAllCustom() {
        return clienteRepository.findByEstadoTrue();
    }

    @Override
    public List<ClienteEntity> findAllInactive() {
        return clienteRepository.findByEstadoFalse();
    }

    @Override
    public List<ClienteEntity> findByNombreContainingIgnoreCase(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public ClienteEntity findById(Long id) {
        Optional<ClienteEntity> clienteOpt = clienteRepository.findById(id);
        return clienteOpt.orElse(null);
    }

    @Override
    public ClienteEntity save(ClienteEntity cliente) {
        return clienteRepository.save(cliente);
    }

    @Override
    public ClienteEntity update(ClienteEntity cliente, Long id) {
        if (clienteRepository.existsById(id)) {
            cliente.setId(id);
            return clienteRepository.save(cliente);
        }
        return null;
    }

    @Override
    public ClienteEntity delete(Long id) {
        clienteRepository.findById(id).ifPresent(cliente -> {
            cliente.setEstado(false);
            clienteRepository.save(cliente);
        });
        return null;
    }

    @Override
    public ClienteEntity enable(Long id) {
        clienteRepository.findById(id).ifPresent(cliente -> {
            cliente.setEstado(true);
            clienteRepository.save(cliente);
        });
        return null;
    }

    @Override
    public List<ClienteEntity> findByDocumentoContainingIgnoreCase(String documento) {
        return clienteRepository.findByDocumentoContainingIgnoreCase(documento);
    }
    
    @Override
	public Optional<ClienteEntity> actualizarEstado(Long id, boolean nuevoEstado) {
	    return clienteRepository.findById(id).map(cliente -> {
	    	cliente.setEstado(nuevoEstado);
	        return clienteRepository.save(cliente);
	    });
	}
       
}
