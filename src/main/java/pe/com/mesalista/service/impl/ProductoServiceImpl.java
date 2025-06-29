package pe.com.mesalista.service.impl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import pe.com.mesalista.entity.ProductoEntity;
import pe.com.mesalista.repository.ProductoRepository;
import pe.com.mesalista.service.ProductoService;
import pe.com.mesalista.util.SystemStatusVerifier;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

	private final ProductoRepository productoRepository;
	
	@Autowired
    private SystemStatusVerifier sys;


	@Override
	public List<ProductoEntity> findAll() {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findAll();
	}

	@Override
	@Transactional
	public void resetEstadoProductos() {
		sys.checkSystemActiveOrThrow();
	    productoRepository.resetEstadoProductos();
	}

	@Override
	@Transactional
	public void activarProductoDelDia(Integer productoId) {
		sys.checkSystemActiveOrThrow();
	    productoRepository.activarProductoDelDia(productoId);
	}

	
	@Override
	public Optional<ProductoEntity> findById(Long id) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findById(id);
	}

	@Override
	public ProductoEntity save(ProductoEntity producto) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.save(producto);
	}

	@Override
	public Optional<ProductoEntity> update(Long id, ProductoEntity producto) {
		sys.checkSystemActiveOrThrow();
	    return productoRepository.findById(id).map(p -> {
	        p.setNombre(producto.getNombre());
	        p.setTipoProducto(producto.getTipoProducto());
	        p.setPrecio(producto.getPrecio());
	        p.setEstado(producto.isEstado());

	        // Solo actualiza imagen si se recibió una nueva
	        if (producto.getImagenUrl() != null) {
	            p.setImagenUrl(producto.getImagenUrl());
	        }

	        return productoRepository.save(p);
	    });
	}


	@Override
	public Optional<ProductoEntity> deleteById(Long id) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findById(id).map(p -> {
			p.setEstado(false);
			return productoRepository.save(p);
		});
	}

	@Override
	public List<ProductoEntity> findByEstadoTrue() {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findByEstadoTrue();
	}

	@Override
	public List<ProductoEntity> findByEstadoFalse() {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findByEstadoFalse();
	}
	
	// Métodos casi gemelos
	@Override
	public List<ProductoEntity> findByNombreContainingIgnoreCase(String nombre) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findByNombreContainingIgnoreCase(nombre);
	}
	
	@Override
	public List<ProductoEntity> findByNombreContainingIgnoreCaseAndEstadoTrue(String nombre) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findByNombreContainingIgnoreCaseAndEstadoTrue(nombre);
	}

	
	@Override
	public List<ProductoEntity> findByTipoProducto(byte tipoProducto) {
		sys.checkSystemActiveOrThrow();
		return productoRepository.findByTipoProducto(tipoProducto);
	}
	
	@Override
	public Optional<ProductoEntity> actualizarEstado(Long id, boolean nuevoEstado) {
		sys.checkSystemActiveOrThrow();
	    return productoRepository.findById(id).map(producto -> {
	        producto.setEstado(nuevoEstado);
	        return productoRepository.save(producto);
	    });
	}
	
	@Override
	public List<ProductoEntity> findByTipoProductoAndEstadoTrue(byte tipoProducto) {
		sys.checkSystemActiveOrThrow();
	    return productoRepository.findByTipoProductoAndEstadoTrue(tipoProducto);
	}
}
