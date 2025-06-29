package pe.com.mesalista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.mesalista.entity.SystemEntity;

public interface SystemEntityRepository extends JpaRepository<SystemEntity, Long> {
}
