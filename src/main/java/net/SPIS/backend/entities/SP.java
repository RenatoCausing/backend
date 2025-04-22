package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

@Entity
@Table(name = "sp")
@Data
public class SP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer spId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String semester;

    @Column(columnDefinition = "TEXT")
    private String abstractText; // Note: You have both 'abstract' and 'abstract_text' in your schema.

    private String uri;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "date_issued", nullable = false)
    private LocalDate dateIssued;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private Admin uploadedBy;

    // group_id exists in schema but not mapped here for SP-Student authoring M2M
    // @ManyToOne
    // @JoinColumn(name = "group_id")
    // private Groups group; // Removed direct link for M2M authoring

    @ManyToOne
    @JoinColumn(name = "adviser_id", nullable = false)
    private Admin adviser;

    @ManyToMany
    @JoinTable(name = "sp_tags", joinColumns = @JoinColumn(name = "sp_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    // ✅ UPDATED: Add fetch strategy for the students collection
    @ManyToMany
    @JoinTable(name = "sp_students", // This is the join table name
            joinColumns = @JoinColumn(name = "sp_id"), // Column in sp_students referencing SP
            inverseJoinColumns = @JoinColumn(name = "student_id")) // Column in sp_students referencing Student
    @Fetch(FetchMode.JOIN) // ✅ Use FetchMode.JOIN to eagerly fetch students with the SP
    private Set<Student> students = new HashSet<>();
}