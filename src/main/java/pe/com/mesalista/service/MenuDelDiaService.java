package pe.com.mesalista.service;

import java.util.List;
import pe.com.mesalista.entity.MenuDelDiaEntity;
import pe.com.mesalista.entity.DiaEntity;

public interface MenuDelDiaService {

    // Obtener todos los productos asignados a un día específico
    List<MenuDelDiaEntity> obtenerPorDia(DiaEntity dia);

    // Eliminar todos los productos de un día (para resetear el menú)
    void eliminarPorDia(DiaEntity dia);

    // Verificar si un producto está asignado a un día específico
    boolean existeProductoEnDia(Long productoId, Byte diaId);

    // Guardar o asignar un producto a un día (por ejemplo, para agregar al menú)
    MenuDelDiaEntity guardar(MenuDelDiaEntity menuDelDiaEntity);
    
    void eliminarProductoDeDia(Long productoId, Byte diaId);


}
