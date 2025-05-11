package pe.com.mesalista.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "TipoProductoEntity")
@Table(name = "tipo_producto")
public class TipoProductoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nombre", length = 20, nullable = false)
	private String nombre;

}
