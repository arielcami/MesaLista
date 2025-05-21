package pe.com.mesalista.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "ProductoEntity")
@Table(name = "productos")
public class ProductoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nombre", length = 100, nullable = false)
	private String nombre;

	@Column(name = "tipo_producto", nullable = false)
	private byte tipoProducto;

	@Column(name = "precio", nullable = false)
	private double precio;  

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
