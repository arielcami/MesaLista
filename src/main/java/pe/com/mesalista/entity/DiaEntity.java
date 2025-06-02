package pe.com.mesalista.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "DiaEntity")
@Table(name = "dias")
public class DiaEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private Byte id;

    @Column(length = 10, nullable = false)
    private String nombre;
}
