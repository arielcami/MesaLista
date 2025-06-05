package pe.com.mesalista.dto;

import java.time.LocalDateTime;

public class IncidenteDTO {

	private Long id;
	private Long pedidoId;
	private Long deliveryId;
	private String ubicacion;
	private String incidente;
	private Byte estado;
	private LocalDateTime fecha;
	private String nombreDelivery;

	// Constructor vacío
	public IncidenteDTO() {
	}

	// Constructor con campos (opcional)
	public IncidenteDTO(Long id, Long pedidoId, Long deliveryId, String ubicacion, String incidente, Byte estado,
			LocalDateTime fecha, String nombreDelivery) {
		this.id = id;
		this.pedidoId = pedidoId;
		this.deliveryId = deliveryId;
		this.ubicacion = ubicacion;
		this.incidente = incidente;
		this.estado = estado;
		this.fecha = fecha;
		this.nombreDelivery = nombreDelivery;
	}

	// Getters y setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getPedidoId() {
		return pedidoId;
	}

	public void setPedidoId(Long pedidoId) {
		this.pedidoId = pedidoId;
	}

	public Long getDeliveryId() {
		return deliveryId;
	}

	public void setDeliveryId(Long deliveryId) {
		this.deliveryId = deliveryId;
	}

	public String getUbicacion() {
		return ubicacion;
	}

	public void setUbicacion(String ubicacion) {
		this.ubicacion = ubicacion;
	}

	public String getIncidente() {
		return incidente;
	}

	public Byte getEstado() {
		return estado;
	}

	public void setEstado(Byte estado) {
		this.estado = estado;
	}

	public void setIncidente(String incidente) {
		this.incidente = incidente;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}

	public String getNombreDelivery() {
		return nombreDelivery;
	}

	public void setNombreDelivery(String nombreDelivery) {
		this.nombreDelivery = nombreDelivery;
	}
}