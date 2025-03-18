package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

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
    private String abstractText;

    private String uri;
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0; // Default value of 0

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "date_issued", nullable = false)
    private LocalDate dateIssued;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private Admin uploadedBy;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;
    @ManyToOne
    @JoinColumn(name = "adviser_id", nullable = false)
    private Admin adviser;

    @ManyToMany
    @JoinTable(name = "sp_tags", joinColumns = @JoinColumn(name = "sp_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags;

}