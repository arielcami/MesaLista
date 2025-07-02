package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.entity.MesaEntity;
import pe.com.mesalista.repository.MesaRepository;
import pe.com.mesalista.service.MesaService;
import pe.com.mesalista.util.SystemStatusVerifier;

@Service
public class MesaServiceImpl implements MesaService {

    @Autowired
    private MesaRepository mesaRepository;
    
    @Autowired
    private SystemStatusVerifier sys;

    @Override
    public List<MesaEntity> listarTodasLasMesas() {
    	sys.checkSystemActiveOrThrow();
    	return mesaRepository.findAll();
    }
    
    @Override
    public MesaEntity crearMesa(MesaEntity mesa) {
        sys.checkSystemActiveOrThrow();

        // Verificar si ya existe una mesa con ese nombre
        Optional<MesaEntity> existente = mesaRepository.findByNombre(mesa.getNombre());
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Ya existe una mesa con el nombre: " + mesa.getNombre());
        }

        mesa.setEstado(1);
        return mesaRepository.save(mesa);
    }

    
    @Override
    public void eliminarMesaPorId(Integer idMesa) {
    	if (!mesaRepository.existsById(idMesa)) {
    		throw new RuntimeException("No existe una mesa con ID: " + idMesa);
    	}
    	mesaRepository.deleteById(idMesa);
    }
    
    @Override
    public Optional<MesaEntity> buscarPorClienteId(Integer clienteId) {
        sys.checkSystemActiveOrThrow();
        return mesaRepository.findByClienteId(clienteId);
    }
    
    @Override
    public void asignarClienteYEmpleado(Integer mesaId, Integer clienteId, Integer empleadoId) {
    	sys.checkSystemActiveOrThrow();
        Optional<MesaEntity> mesaExistente = mesaRepository.findByClienteId(clienteId);

        if (mesaExistente.isPresent()) {
            throw new IllegalStateException("Este cliente ya está asignado a otra mesa (ID: " + mesaExistente.get().getId() + ")");
        }

        mesaRepository.asignarClienteYEmpleado(mesaId, clienteId, empleadoId);
    }
   
    
    @Override
    public List<MesaEntity> listarMesasPorEstado(int estado) {
    	sys.checkSystemActiveOrThrow();
        return mesaRepository.findByEstado(estado);
    }
    
    @Override
	public List<MesaEntity> listarMesasDisponibles() {
    	sys.checkSystemActiveOrThrow();
		return mesaRepository.findByEstado(1);
	}
        
	@Override
	public void actualizarEstadoMesa(int idMesa, int nuevoEstado, Integer clienteId) {
		sys.checkSystemActiveOrThrow();

        Optional<MesaEntity> optionalMesa = mesaRepository.findById(idMesa);

        if (optionalMesa.isPresent()) {
            MesaEntity mesa = optionalMesa.get();
            mesa.setEstado(nuevoEstado);

            // Si se pasa un clienteId válido, lo asignamos. Si no, lo dejamos null.
            if (clienteId != null && clienteId > 0) {
                ClienteEntity cliente = new ClienteEntity();
                
                Long clienteIdLong = clienteId.longValue(); // El metodo setId de abajo solo acepta Long
                
                cliente.setId(clienteIdLong); // solo seteamos el ID (lazy binding)
                mesa.setCliente(cliente);
            } else {
                mesa.setCliente(null); // desasignar cliente si no se pasó ID válido
            }

            mesaRepository.save(mesa);
        } else {
            throw new RuntimeException("Mesa no encontrada con ID: " + idMesa);
        }
		
	}

	@Override
	public void desalojarMesa(Integer mesaId) {
		sys.checkSystemActiveOrThrow();
		mesaRepository.desalojarMesaPorId(mesaId);
	}

	@Override
	public void clausurarMesa(Integer mesaId) {
		sys.checkSystemActiveOrThrow();
		mesaRepository.clausurarMesaPorId(mesaId);
	}
	
	@Override
	public void habilitarMesa(Integer mesaId) {
		sys.checkSystemActiveOrThrow();
		mesaRepository.aperturarMesaPorId(mesaId);
	}

	@Override
    @Transactional
    public void moverClienteDeMesa(Integer mesaOrigenId, Integer clienteId, Integer mesaDestinoId) {
		sys.checkSystemActiveOrThrow();
        mesaRepository.moverClienteDeMesa(mesaOrigenId, clienteId, mesaDestinoId);
    }

}
