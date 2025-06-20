package pe.com.mesalista.entity;

import java.io.Serial;
import java.io.Serializable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "TipoProductoEntity")
@Table(name = "tipo_producto")
public class TipoProductoEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nombre", length = 20, nullable = false)
	private String nombre;

}
