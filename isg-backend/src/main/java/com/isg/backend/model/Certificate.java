package com.isg.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // e.g., "MYK", "G-Sınıfı Ehliyet", "Sağlık Raporu"

    @Column
    private LocalDate issueDate;

    @Column
    private LocalDate expiryDate;

    @Column
    private String description;

    @Column
    private String remarks; // For justifications like "Not required for driver"

    @ManyToOne
    @JoinColumn(name = "personnel_id")
    private Personnel personnel;
}
