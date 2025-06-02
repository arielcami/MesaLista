package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.mesalista.entity.DiaEntity;

@Repository
public interface DiaRepository extends JpaRepository<DiaEntity, Byte> {}
