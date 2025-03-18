package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "faculty")
@Data
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer facultyId; // Must match the property name in the query

    @Column(name = "faculty_name", nullable = false)
    private String facultyName;
}