package pe.com.mesalista.dto;

import lombok.Data;

@Data
public class MovimientoMesaRequest {
	private Integer mesaOrigenId;
	private Integer clienteId;
	private Integer mesaDestinoId;
}