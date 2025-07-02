package pe.com.mesalista.service;

import java.util.List;
import java.util.Optional;
import pe.com.mesalista.entity.MesaEntity;

public interface MesaService {

	List<MesaEntity> listarTodasLasMesas();

	List<MesaEntity> listarMesasDisponibles();

	List<MesaEntity> listarMesasPorEstado(int estado);

	void actualizarEstadoMesa(int idMesa, int nuevoEstado, Integer clienteId);

	Optional<MesaEntity> buscarPorClienteId(Integer clienteId);
	
	void asignarClienteYEmpleado(Integer mesaId, Integer clienteId, Integer empleadoId);
	
	void desalojarMesa(Integer mesaId);
	
	void clausurarMesa(Integer mesaId);
	
	void habilitarMesa(Integer mesaId);
	
	MesaEntity crearMesa(MesaEntity mesa);

	void eliminarMesaPorId(Integer idMesa);
	
	void moverClienteDeMesa(Integer mesaOrigenId, Integer clienteId, Integer mesaDestinoId);

}
