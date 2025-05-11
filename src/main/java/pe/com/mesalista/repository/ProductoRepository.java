package pe.com.mesalista.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.com.mesalista.entity.ProductoEntity;

public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {

    // Productos activos
    List<ProductoEntity> findByEstadoTrue();

    // Productos inactivos
    List<ProductoEntity> findByEstadoFalse();

    // Búsqueda por nombre que contenga un texto (ignorando mayúsculas/minúsculas)
    List<ProductoEntity> findByNombreContainingIgnoreCase(String nombre);

    // Búsqueda por tipo de producto (ej: 1 = Entrada, 2 = Segundo, etc.)
    List<ProductoEntity> findByTipoProducto(byte tipoProducto);

}
