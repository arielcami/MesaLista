package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import pe.com.mesalista.entity.ProductoEntity;
import pe.com.mesalista.repository.ProductoRepository;
import pe.com.mesalista.service.ProductoService;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

	private final ProductoRepository productoRepository;

	@Override
	public List<ProductoEntity> findAll() {
		return productoRepository.findAll();
	}

	@Override
	public Optional<ProductoEntity> findById(Long id) {
		return productoRepository.findById(id);
	}

	@Override
	public ProductoEntity save(ProductoEntity producto) {
		return productoRepository.save(producto);
	}

	@Override
	public Optional<ProductoEntity> update(Long id, ProductoEntity producto) {
	    ProductoEntity p = productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
	    p.setNombre(producto.getNombre());
	    p.setTipoProducto(producto.getTipoProducto());
	    p.setPrecio(producto.getPrecio());
	    p.setEstado(producto.isEstado());
	    return Optional.of(productoRepository.save(p));
	}


	@Override
	public Optional<ProductoEntity> deleteById(Long id) {
		return productoRepository.findById(id).map(p -> {
			p.setEstado(false);
			return productoRepository.save(p);
		});
	}

	@Override
	public List<ProductoEntity> findByEstadoTrue() {
		return productoRepository.findByEstadoTrue();
	}

	@Override
	public List<ProductoEntity> findByEstadoFalse() {
		return productoRepository.findByEstadoFalse();
	}

	@Override
	public List<ProductoEntity> findByNombreContainingIgnoreCase(String nombre) {
		return productoRepository.findByNombreContainingIgnoreCase(nombre);
	}

	@Override
	public List<ProductoEntity> findByTipoProducto(byte tipoProducto) {
		return productoRepository.findByTipoProducto(tipoProducto);
	}
	
	@Override
	public Optional<ProductoEntity> actualizarEstado(Long id, boolean nuevoEstado) {
	    return productoRepository.findById(id).map(producto -> {
	        producto.setEstado(nuevoEstado);
	        return productoRepository.save(producto);
	    });
	}
	
	@Override
	public List<ProductoEntity> findByTipoProductoAndEstadoTrue(byte tipoProducto) {
	    return productoRepository.findByTipoProductoAndEstadoTrue(tipoProducto);
	}

}
