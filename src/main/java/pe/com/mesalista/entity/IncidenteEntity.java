package pe.com.mesalista.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "IncidenteEntity")
@Table(name = "incidentes")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class IncidenteEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "delivery_id", nullable = false)
	private EmpleadoEntity delivery;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "pedido_id", nullable = false)
	private PedidoEntity pedido;

	@Column(name = "ubicacion", length = 60)
	private String ubicacion;

	@Column(name = "estado", nullable = false)
	private byte estado;

	@Column(name = "incidente", columnDefinition = "TEXT")
	private String incidente;

	@CreationTimestamp
	@Column(name = "fecha", updatable = false)
	private LocalDateTime fecha;
}
