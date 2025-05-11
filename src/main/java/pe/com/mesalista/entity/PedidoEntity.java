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
@Entity(name = "PedidoEntity")
@Table(name = "pedidos")
public class PedidoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY) // Mejor usar LAZY aquí para rendimiento
	@JoinColumn(name = "cliente_id", nullable = false)
	private ClienteEntity cliente;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "empleado_id", nullable = false) // Faltaba este mapeo en tu código
	private EmpleadoEntity empleado;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private DeliveryEntity delivery;

	@Column(nullable = false)
	private double total;

	@Column(name = "estado_pedido", nullable = false)
	private byte estadoPedido;

	@Column(name = "direccion_entrega", length = 200, nullable = false)
	private String direccionEntrega;

	@Column(name = "fecha_pedido", nullable = false, updatable = false)
	private LocalDateTime fechaPedido;

	@CreationTimestamp
	@Column(name = "creado_en", updatable = false)
	private LocalDateTime creadoEn;

	@UpdateTimestamp
	@Column(name = "actualizado_en")
	private LocalDateTime actualizadoEn;
}
