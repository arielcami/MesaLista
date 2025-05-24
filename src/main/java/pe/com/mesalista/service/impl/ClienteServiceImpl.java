package pe.com.mesalista.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.repository.ClienteRepository;
import pe.com.mesalista.service.ClienteService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.persistence.PersistenceContext;

@Service
public class ClienteServiceImpl implements ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public List<ClienteEntity> findAll() {
        return clienteRepository.findAll();
    }

    @Override
    public List<ClienteEntity> findByNombreContainingIgnoreCase(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Override
    public List<ClienteEntity> findByDocumentoContainingIgnoreCase(String nombre) {
        return clienteRepository.findByDocumentoContainingIgnoreCase(nombre);
    }

    @PersistenceContext
    private EntityManager entityManager;
    
    // SP
    @Override
    public Map<String, Object> addClienteSP(String nombre, String telefono, String documento, String direccion) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("addCliente");

        // Registrar parámetros
        query.registerStoredProcedureParameter("cliente_nombre", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("cliente_telefono", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("cliente_documento", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("cliente_direccion", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("created", Boolean.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("msg", String.class, ParameterMode.OUT);

        // Setear parámetros IN
        query.setParameter("cliente_nombre", nombre);
        query.setParameter("cliente_telefono", telefono);
        query.setParameter("cliente_documento", documento);
        query.setParameter("cliente_direccion", direccion);

        // Ejecutar
        query.execute();

        // Obtener OUT
        Boolean created = (Boolean) query.getOutputParameterValue("created");
        String msg = (String) query.getOutputParameterValue("msg");

        return Map.of("created", created != null ? created : false, "msg", msg != null ? msg : "");
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
    public ClienteEntity findByDocumento(String documento) {
        return clienteRepository.findByDocumento(documento);
    }

   
}
