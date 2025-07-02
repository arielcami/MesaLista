package pe.com.mesalista.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.MesaEntity;

@Repository
public interface MesaRepository extends JpaRepository<MesaEntity, Integer> {
	
	Optional<MesaEntity> findByNombre(String nombre);
	
	List<MesaEntity> findByEstado(Integer estado);

	Optional<MesaEntity> findByClienteId(Integer clienteId);

	// Ocupar una mesa con un pedido que tiene un pedido para comer en el
	// restaurante y un empleado que lo atiende.
	@Modifying
	@Transactional
	@Query("UPDATE MesaEntity m SET m.cliente.id = :clienteId, m.empleado.id = :empleadoId, m.horaAsignacion = CURRENT_TIMESTAMP, m.estado = 2 WHERE m.id = :mesaId")
	int asignarClienteYEmpleado(@Param("mesaId") Integer mesaId, @Param("clienteId") Integer clienteId,
			@Param("empleadoId") Integer empleadoId);

	// Desalojar mesa, deja la mesa disponible otra vez.
	@Modifying
	@Transactional
	@Query("UPDATE MesaEntity m SET m.estado = 1, m.cliente = NULL, m.pedido = NULL, m.empleado = NULL, m.horaAsignacion = NULL WHERE m.id = :mesaId")
	int desalojarMesaPorId(@Param("mesaId") Integer mesaId);

	// Desalojar mesa, pero la inhabilita.
	@Modifying
	@Transactional
	@Query("UPDATE MesaEntity m SET m.estado = 0, m.cliente = NULL, m.pedido = NULL, m.empleado = NULL, m.horaAsignacion = NULL WHERE m.id = :mesaId")
	int clausurarMesaPorId(@Param("mesaId") Integer mesaId);

	// Abrir la mesa.
	@Modifying
	@Transactional
	@Query("UPDATE MesaEntity m SET m.estado = 1, m.cliente = NULL, m.pedido = NULL, m.empleado = NULL, m.horaAsignacion = NULL WHERE m.id = :mesaId")
	int aperturarMesaPorId(@Param("mesaId") Integer mesaId);
	
	
}
