package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.EmpleadoEntity;
import java.util.List;

public interface EmpleadoRepository extends JpaRepository<EmpleadoEntity, Long> {

	// Buscar empleados por estado
	@Query("SELECT e FROM EmpleadoEntity e WHERE e.estado = :estado")
	List<EmpleadoEntity> findByEstado(@Param("estado") boolean estado);
	
	// Buscar empleados por nombre
    List<EmpleadoEntity> findByNombreContainingIgnoreCase(String nombre);
    
    List<EmpleadoEntity> findByNivel(int nivel);
	
}
