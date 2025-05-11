package pe.com.mesalista.service;

import java.util.List;
import java.util.Optional;

import pe.com.mesalista.entity.ProductoEntity;

public interface ProductoService {

	List<ProductoEntity> findAll();

	Optional<ProductoEntity> findById(Long id);

	ProductoEntity save(ProductoEntity producto);

	Optional<ProductoEntity> update(Long id, ProductoEntity producto);

	Optional<ProductoEntity> deleteById(Long id);

	List<ProductoEntity> findByEstadoTrue();

	List<ProductoEntity> findByEstadoFalse();

	List<ProductoEntity> findByNombreContainingIgnoreCase(String nombre);

	List<ProductoEntity> findByTipoProducto(byte tipoProducto);
	
	Optional<ProductoEntity> actualizarEstado(Long id, boolean estado);

}
