package pe.com.mesalista.entity;

import java.io.Serial;
import java.io.Serializable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "DiaEntity")
@Table(name = "dias")
public class DiaEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Byte id;

    @Column(length = 10, nullable = false)
    private String nombre;
}
