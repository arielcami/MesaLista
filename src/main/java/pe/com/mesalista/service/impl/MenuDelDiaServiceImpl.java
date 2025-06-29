package pe.com.mesalista.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import pe.com.mesalista.entity.MenuDelDiaEntity;
import pe.com.mesalista.entity.DiaEntity;
import pe.com.mesalista.repository.MenuDelDiaRepository;
import pe.com.mesalista.service.MenuDelDiaService;
import pe.com.mesalista.util.SystemStatusVerifier;

@Service
public class MenuDelDiaServiceImpl implements MenuDelDiaService {

    @Autowired
    private MenuDelDiaRepository repository;
    
    @Autowired
    private SystemStatusVerifier sys;

    @Override
    public List<MenuDelDiaEntity> obtenerPorDia(DiaEntity dia) {
    	sys.checkSystemActiveOrThrow();
        return repository.findByDia(dia);
    }

    @Override
    public void eliminarPorDia(DiaEntity dia) {
    	sys.checkSystemActiveOrThrow();
    	repository.deleteByDia(dia);
    }

    @Override
    public boolean existeProductoEnDia(Long productoId, Byte diaId) {
    	sys.checkSystemActiveOrThrow();
        return repository.existsByProducto_IdAndDia_Id(productoId, diaId);
    }

    @Override
    public MenuDelDiaEntity guardar(MenuDelDiaEntity menuDelDiaEntity) {
    	sys.checkSystemActiveOrThrow();
        return repository.save(menuDelDiaEntity);
    }
    
    @Transactional
    @Override
    public void eliminarProductoDeDia(Long productoId, Byte diaId) {
    	sys.checkSystemActiveOrThrow();
    	repository.deleteByProductoIdAndDiaId(productoId, diaId);
    }
    
}
