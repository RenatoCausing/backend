package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sp") // Ensure table name is 'sp'
@Data // Lombok annotation for getters, setters, equals, hashCode, and toString
public class SP {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-incrementing
        @Column(name = "sp_id") // Explicitly map to sp_id column
        private Integer spId;
        @Column(name = "title", nullable = false) // Map to title column, not null
        private String title;
        @Column(name = "year") // Map to year column (nullable based on new script)
        private Integer year;
        @Column(name = "semester") // Map to semester column (nullable based on new script)
        private String semester;
        @Column(name = "abstract_text", columnDefinition = "TEXT") // Map to abstract_text column, TEXT type
        private String abstractText;
        @Column(name = "uri") // Map to uri column
        private String uri;
        @Column(name = "document_path") // Map to document_path column
        private String documentPath;
        @Column(name = "date_issued") // Map to date_issued column (nullable based on new script)
        private LocalDate dateIssued;
        @Column(name = "view_count") // Map to view_count column
        private Integer viewCount = 0; // Default value set in DB script, good to have here too

        // Many-to-one relationship with Admin (for the uploader)
        @ManyToOne(fetch = FetchType.LAZY) // Use LAZY loading
        @JoinColumn(name = "uploaded_by") // *** CORRECTED TO MATCH YOUR OLD SCRIPT'S COLUMN NAME ***
        private Admin uploadedBy;
        // This field can now be null

        // Many-to-one relationship with Admin (for the adviser)
        @ManyToOne(fetch = FetchType.LAZY) // Use LAZY loading
        @JoinColumn(name = "adviser_id") // Maps to the adviser_id column (nullable)
        private Admin adviser;
        @ManyToOne(fetch = FetchType.LAZY) // Use LAZY loading for performance
        @JoinColumn(name = "faculty_id") // Name of the foreign key column in the 'sp' table [cite: 252]
        private Faculty faculty;
        // Many-to-one relationship with Group (based on your old script)
        @ManyToOne(fetch = FetchType.LAZY) // Use LAZY loading
        @JoinColumn(name = "group_id") // Maps to the group_id column (nullable based on new script)
        private Groups group;
        // Added back the Group relationship based on your old script

        // Many-to-many relationship with Student
        @ManyToMany
        @JoinTable(name = "sp_students", // Name of the join table
                        joinColumns = @JoinColumn(name = "sp_id"), // Column in sp_students referencing sp
                        inverseJoinColumns = @JoinColumn(name = "student_id") // Column in sp_students referencing
                                                                              // student
        )
        private Set<Student> students = new HashSet<>();
        // Many-to-many relationship with Tag
        @ManyToMany
        @JoinTable(name = "sp_tags", // Name of the join table
                        joinColumns = @JoinColumn(name = "sp_id"), // Column in sp_tags referencing sp
                        inverseJoinColumns = @JoinColumn(name = "tag_id") // Column in sp_tags referencing tag
        )
        private Set<Tag> tags = new HashSet<>();
        // Lombok provides getters and setters, but including them here for clarity
        // if you are not using Lombok or for specific customizations.
        // public Integer getSpId() { return spId; }
        // public void setSpId(Integer spId) { this.spId = spId;
        // }
        // ... other getters and setters ...
}