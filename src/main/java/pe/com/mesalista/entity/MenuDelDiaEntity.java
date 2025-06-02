package pe.com.mesalista.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "MenuDelDiaEntity")
@Table(name = "menu_del_dia", uniqueConstraints = {
		@UniqueConstraint(name = "uq_producto_dia", columnNames = { "producto_id", "dia_id" }) }, indexes = {
				@Index(name = "idx_dia_id", columnList = "dia_id") })
public class MenuDelDiaEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Evitamos la serialización de proxies hibernate que dan error
	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "producto_id", nullable = false, foreignKey = @ForeignKey(name = "fk_menu_producto"))
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private ProductoEntity producto;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "dia_id", nullable = false, foreignKey = @ForeignKey(name = "fk_menu_dia"))
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private DiaEntity dia;

}
