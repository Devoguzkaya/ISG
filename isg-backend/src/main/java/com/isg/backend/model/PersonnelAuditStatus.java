package com.isg.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personnel_audit_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonnelAuditStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "checklist_id", nullable = false)
    @JsonIgnore
    private Checklist checklist;

    @Column(nullable = false)
    private Long personnelId;

    @Column(nullable = false)
    private String personnelName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompliant = true;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
