package pe.com.mesalista.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pe.com.mesalista.entity.MenuDelDiaEntity;
import pe.com.mesalista.entity.DiaEntity;
import pe.com.mesalista.repository.MenuDelDiaRepository;
import pe.com.mesalista.service.MenuDelDiaService;

@Service
public class MenuDelDiaServiceImpl implements MenuDelDiaService {

    @Autowired
    private MenuDelDiaRepository repository;

    @Override
    public List<MenuDelDiaEntity> obtenerPorDia(DiaEntity dia) {
        return repository.findByDia(dia);
    }

    @Override
    public void eliminarPorDia(DiaEntity dia) {
    	repository.deleteByDia(dia);
    }

    @Override
    public boolean existeProductoEnDia(Long productoId, Byte diaId) {
        return repository.existsByProducto_IdAndDia_Id(productoId, diaId);
    }

    @Override
    public MenuDelDiaEntity guardar(MenuDelDiaEntity menuDelDiaEntity) {
        return repository.save(menuDelDiaEntity);
    }
}
