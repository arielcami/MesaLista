package pe.com.mesalista.entity;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "DeliveryEntity")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "deliveries")
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "id")
public class DeliveryEntity extends EmpleadoEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Column(name = "unidad", length = 25, nullable = false)
	private String unidad;

	@Column(name = "placa", length = 8, nullable = false, unique = true)
	private String placa;
}
