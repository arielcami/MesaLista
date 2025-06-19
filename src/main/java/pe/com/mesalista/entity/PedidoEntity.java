package pe.com.mesalista.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cliente_id", nullable = false)
	private ClienteEntity cliente;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "empleado_id", nullable = false)
	private EmpleadoEntity empleado;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "delivery_id")
	private DeliveryEntity delivery;

	@Column(nullable = false)
	private double total;

	@Column(name = "estado_pedido", nullable = false)
	private byte estadoPedido;
	
	@Column(name = "para_llevar")
	private boolean paraLlevar;

	@Column(name = "direccion_entrega", length = 200, nullable = false)
	private String direccionEntrega;

	@Column(name = "fecha_pedido", nullable = false, updatable = false)
	private LocalDateTime fechaPedido;
	
	@Column(name = "visible")
	@JsonIgnore
	private boolean visible;

	@CreationTimestamp
	@JsonIgnore
	@Column(name = "creado_en", updatable = false)
	private LocalDateTime creadoEn;

	@UpdateTimestamp
	@JsonIgnore
	@Column(name = "actualizado_en")
	private LocalDateTime actualizadoEn;
	
	@OneToMany(mappedBy = "pedido", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JsonManagedReference
	private List<DetallePedidoEntity> detalles;
	
}
