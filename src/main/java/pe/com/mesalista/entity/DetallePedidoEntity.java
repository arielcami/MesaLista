package pe.com.mesalista.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "DetallePedidoEntity")
@Table(name = "detalle_pedido")
public class DetallePedidoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne
	@JoinColumn(name = "pedido_id", nullable = false)
	private PedidoEntity pedido;

	@ManyToOne
	@JoinColumn(name = "producto_id", nullable = false)
	private ProductoEntity producto;

	@Column(name = "cantidad", nullable = false)
	private byte cantidad;

	@Column(name = "precio_unitario", nullable = false)
	private Double precioUnitario;

	@Column(name = "estado", nullable = false)
	private byte estado;

	@CreationTimestamp
	@Column(name = "creado_en", updatable = false)
	private LocalDateTime creadoEn;

	@UpdateTimestamp
	@Column(name = "actualizado_en")
	private LocalDateTime actualizadoEn;
}
