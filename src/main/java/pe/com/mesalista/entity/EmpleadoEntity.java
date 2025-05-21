package pe.com.mesalista.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "EmpleadoEntity")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "empleados")
@Inheritance(strategy = InheritanceType.JOINED)
public class EmpleadoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "nombre", length = 100, nullable = false)
	private String nombre;

	@Column(name = "documento", length = 12, nullable = false, unique = true)
	private String documento;

	@Column(name = "telefono", length = 19, nullable = false)
	private String telefono;

	@Column(name = "clave", length = 45, nullable = false)
	private String clave;

	@Column(name = "direccion", length = 200, nullable = false)
	private String direccion;

	@Column(name = "nivel", nullable = false)
	private short nivel;

	@Column(name = "estado", nullable = false)
	private boolean estado;

	@CreationTimestamp
	@JsonIgnore
	@Column(name = "creado_en", updatable = false)
	private LocalDateTime creadoEn;

	@UpdateTimestamp
	@JsonIgnore
	@Column(name = "actualizado_en")
	private LocalDateTime actualizadoEn;
	
	
}
