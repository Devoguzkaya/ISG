package com.isg.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "checklists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String type; // e.g., "DAILY_VEHICLE", "WEEKLY_SITE"

    @Column(nullable = false)
    @Builder.Default
    private String status = "SUBMITTED"; // DRAFT, SUBMITTED, ARCHIVED

    @Column
    private String siteLocation; // e.g., "Boyabat", "Sinop Merkez"

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "personnel_id")
    private Personnel personnel; // Person doing the check

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItem> items;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PersonnelAuditStatus> personnelAudits;

    @ManyToMany
    @JoinTable(
        name = "checklist_vehicles",
        joinColumns = @JoinColumn(name = "checklist_id"),
        inverseJoinColumns = @JoinColumn(name = "vehicle_id")
    )
    private List<Vehicle> involvedVehicles;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String generalRemarks;

    @Column(columnDefinition = "TEXT")
    private String metadataJson; // JSON string for custom fields (e.g., firmName, workDescription)

    @Column
    @Builder.Default
    private boolean physicalDocumentReady = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
