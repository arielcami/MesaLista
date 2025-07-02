package pe.com.mesalista.entity;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mesas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MesaEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "nombre", nullable = false, length = 10, unique = true)
	private String nombre;


	// 0: desuso, 1: disponible, 2: ocupada
	@Column(name = "estado", columnDefinition = "TINYINT UNSIGNED")
	private Integer estado;

	@ManyToOne
	@JoinColumn(name = "cliente", referencedColumnName = "id", foreignKey = @ForeignKey(name = "mesas_ibfk_1"), unique = true)
	private ClienteEntity cliente;

	@ManyToOne
	@JoinColumn(name = "pedido_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "mesas_ibfk_2"))
	@JsonIgnoreProperties("mesa")  // Evita referencia circular
	private PedidoEntity pedido;

	@ManyToOne
	@JoinColumn(name = "empleado_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "mesas_ibfk_3"))
	private EmpleadoEntity empleado;

	@Column(name = "hora_asignacion")
	private LocalDateTime horaAsignacion;

}
