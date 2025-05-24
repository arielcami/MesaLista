package pe.com.mesalista.RESTcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pe.com.mesalista.entity.ClienteEntity;
import pe.com.mesalista.service.ClienteService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente")
public class ClienteRestController {

    @Autowired
    private ClienteService servicio;

    @GetMapping
    public List<ClienteEntity> findAll() {
        return servicio.findAll();
    }
    
    @PostMapping("addcliente_sp")
    public Map<String, Object> addCliente_sp(@RequestBody ClienteEntity cliente) {
        return servicio.addClienteSP(
            cliente.getNombre(),
            cliente.getTelefono(),
            cliente.getDocumento(),
            cliente.getDireccion()
        );
    }
      
    @GetMapping("buscar-documento")
    public ClienteEntity findByDocumento(@PathVariable String documento) {
    	return servicio.findByDocumento(documento);
    }
    
    @GetMapping("buscar")
    public List<ClienteEntity> findByDocumentoContainingIgnoreCase(@PathVariable String documento) {
    	return servicio.findByDocumentoContainingIgnoreCase(documento);
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
