package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.EmpleadoEntity;
import java.util.List;
import java.util.Map;

public interface EmpleadoRepository extends JpaRepository<EmpleadoEntity, Long> {

	// Buscar empleados por estado
	@Query("SELECT e FROM EmpleadoEntity e WHERE e.estado = :estado")
	List<EmpleadoEntity> findByEstado(@Param("estado") boolean estado);
	
	// Buscar empleados por nombre
    List<EmpleadoEntity> findByNombreContainingIgnoreCase(String nombre);
    
    List<EmpleadoEntity> findByNivel(int nivel);
    
    
    @Procedure(procedureName = "sp_validar_empleado")
    Map<String, Object> spValidarEmpleado(
        @Param("p_id") int p_id,
        @Param("p_clave") String p_clave
    );
    
    
    @Procedure(procedureName = "sp_validar_delivery")
    Map<String, Object> spValidarDelivery(
        @Param("p_id") int p_id,
        @Param("p_clave") String p_clave
    );

}
