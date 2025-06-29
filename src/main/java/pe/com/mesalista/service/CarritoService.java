package pe.com.mesalista.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import pe.com.mesalista.repository.DetallePedidoRepository;
import pe.com.mesalista.repository.PedidoRepository;
import pe.com.mesalista.util.SystemStatusVerifier;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    
    @Autowired
    private SystemStatusVerifier sys;

    // Método para agregar un producto a un pedido
    public Long agregarProducto(Long clienteId, Long productoId, Integer cantidad, double precioUnitario) {
    	sys.checkSystemActiveOrThrow();
        // Llamada al SP 'addProducto' con los parámetros adecuados
        // El procedimiento ahora devuelve el pedido_id
        return pedidoRepository.agregarProducto(clienteId, productoId, cantidad, precioUnitario);
    }
    
    // Versión con pedido ID
    public void agregarProductoConPedidoId(Long pedidoId, Long productoId, Integer cantidad, double precioUnitario) {
    	sys.checkSystemActiveOrThrow();
        pedidoRepository.agregarProductoConPedidoId(pedidoId, productoId, cantidad, precioUnitario);
    }

    // Método para ajustar la cantidad de un producto en un pedido
    public void ajustarCantidadProducto(Long pedidoId, Long productoId, int delta) {
    	sys.checkSystemActiveOrThrow();
        // Llamada al SP 'adjustCantidadProducto' con los parámetros adecuados
        detallePedidoRepository.ajustarCantidadProducto(pedidoId, productoId, delta);
    }
}
