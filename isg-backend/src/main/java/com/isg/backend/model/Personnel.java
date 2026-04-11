package com.isg.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "personnel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Personnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column
    private String role; // e.g., "Operatör", "Şoför", "Teknisyen"

    @Column
    private String phone;
    
    @Column
    private String tcNo; // Necessary for official documents

    @Column
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime validFrom = LocalDateTime.now();

    @Column
    private LocalDateTime validTo;

    @OneToMany(mappedBy = "personnel", cascade = CascadeType.ALL)
    private List<Certificate> certificates;
}
