package pe.com.mesalista.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.mesalista.entity.MenuDelDiaEntity;
import pe.com.mesalista.entity.DiaEntity;

@Repository
public interface MenuDelDiaRepository extends JpaRepository<MenuDelDiaEntity, Long> {

    // Buscar todos los productos asignados a un día específico
    List<MenuDelDiaEntity> findByDia(DiaEntity dia);

    // Eliminar todos los productos de un día (por si el admin resetea el menú del día)
    void deleteByDia(DiaEntity dia);

    // Comprobar si un producto ya está asignado a un día (evita duplicación programáticamente)
    boolean existsByProducto_IdAndDia_Id(Long productoId, Byte diaId);

}
