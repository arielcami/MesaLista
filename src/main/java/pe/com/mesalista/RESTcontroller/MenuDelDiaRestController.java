package pe.com.mesalista.RESTcontroller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import pe.com.mesalista.entity.DiaEntity;
import pe.com.mesalista.entity.MenuDelDiaEntity;
import pe.com.mesalista.service.MenuDelDiaService;

@RestController
@RequestMapping("/api/menu-del-dia")
@RequiredArgsConstructor
public class MenuDelDiaRestController {

    private final MenuDelDiaService menuDelDiaService;

    // Obtener todos los productos asignados a un día específico
    @GetMapping("/dia/{id}")
    public ResponseEntity<List<MenuDelDiaEntity>> getProductosPorDia(@PathVariable Byte id) {
        DiaEntity dia = new DiaEntity();
        dia.setId(id);
        // Aquí podrías validar si existe ese día si quieres robustecer

        List<MenuDelDiaEntity> lista = menuDelDiaService.obtenerPorDia(dia);
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // Guardar un producto para un día (crear asignación)
    @PostMapping
    public ResponseEntity<MenuDelDiaEntity> guardar(@RequestBody MenuDelDiaEntity menuDelDia) {
        // Opcional: validar que no exista ya esta asignación para evitar excepción por UNIQUE constraint
        if (menuDelDiaService.existeProductoEnDia(menuDelDia.getProducto().getId(), menuDelDia.getDia().getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        MenuDelDiaEntity guardado = menuDelDiaService.guardar(menuDelDia);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // Eliminar todas las asignaciones para un día (resetea menú)
    @DeleteMapping("/dia/{id}")
    public ResponseEntity<Void> eliminarPorDia(@PathVariable Byte id) {
        DiaEntity dia = new DiaEntity();
        dia.setId(id);
        menuDelDiaService.eliminarPorDia(dia);
        return ResponseEntity.noContent().build();
    }
}
