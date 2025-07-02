package pe.com.mesalista.dto;

import lombok.Data;

@Data
public class AsignacionRequest {
    private Integer mesaId;
    private Integer clienteId;
    private Integer empleadoId;
    private String claveEmpleado;
}