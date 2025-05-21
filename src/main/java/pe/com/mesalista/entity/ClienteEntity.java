package pe.com.mesalista.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "ClienteEntity")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "clientes")
public class ClienteEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nombre", length = 100, nullable = false)
	private String nombre;

	@Column(name = "telefono", length = 16, nullable = false)
	private String telefono;

	@Column(name = "documento", length = 12, nullable = false, unique = true)
	private String documento;

	@Column(name = "direccion", length = 200, nullable = false)
	private String direccion;

	@CreationTimestamp
	@JsonIgnore
	@Column(name = "creado_en", updatable = false)
	private LocalDateTime creadoEn;

	@UpdateTimestamp
	@JsonIgnore
	@Column(name = "actualizado_en")
	private LocalDateTime actualizadoEn;

}
