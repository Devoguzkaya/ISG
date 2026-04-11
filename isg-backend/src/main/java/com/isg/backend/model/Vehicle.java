package com.isg.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plate;

    @Column(nullable = false)
    private String brandModel;

    @Column
    private String type; // e.g., "Sepetli Vinç"

    @Column
    private String description;

    @Column
    @Builder.Default
    private boolean active = true;

    @Column
    private java.time.LocalDateTime deactivationDate;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<VehicleDocument> documents;
}
