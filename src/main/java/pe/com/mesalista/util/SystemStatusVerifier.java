package pe.com.mesalista.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pe.com.mesalista.entity.SystemEntity;
import pe.com.mesalista.repository.SystemEntityRepository;

@Component
public class SystemStatusVerifier {

	@Autowired
	private SystemEntityRepository repository;

	public boolean isSystemActive() {
		return repository.findAll().stream().findFirst().map(SystemEntity::isEpqmg).orElse(false);
	}

	public void checkSystemActiveOrThrow() {
		if (!isSystemActive()) {
			throw new IllegalStateException("El sistema no está configurado correctamente. Busque la asistencia técnica adecuada.");
		}
	}
}
