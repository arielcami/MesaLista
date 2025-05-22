package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;
import java.util.List;

@RestController
@RequestMapping("/api/cliente")
public class ClienteRestController {

    @Autowired
    private ClienteService servicio;

    @GetMapping
    public List<ClienteEntity> findAll() {
        return servicio.findAll();
    }
   
    @GetMapping("/nombre/{nombre}")
    public List<ClienteEntity> findByNombre(@PathVariable String nombre) {
        return servicio.findByNombreContainingIgnoreCase(nombre);
    }


    @GetMapping("/{id}")
    public ClienteEntity findById(@PathVariable Long id) {
        return servicio.findById(id);
    }

    @PostMapping
    public ClienteEntity add(@RequestBody ClienteEntity cliente) {
        return servicio.save(cliente);
    }

    @PutMapping("/{id}")
    public ClienteEntity update(@RequestBody ClienteEntity cliente, @PathVariable Long id) {
        return servicio.update(cliente, id);
    }
    
}
