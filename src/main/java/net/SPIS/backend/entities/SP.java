package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sp")  
@Data  
public class SP {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)  
        @Column(name = "sp_id")  
        private Integer spId;
        @Column(name = "title", nullable = false)  
        private String title;
        @Column(name = "year")  
        private Integer year;
        @Column(name = "semester")  
        private String semester;
        @Column(name = "abstract_text", columnDefinition = "TEXT")  
        private String abstractText;
        @Column(name = "uri")  
        private String uri;
        @Column(name = "document_path")  
        private String documentPath;
        @Column(name = "date_issued")  
        private LocalDate dateIssued;
        @Column(name = "view_count")  
        private Integer viewCount = 0;  

         
        @ManyToOne(fetch = FetchType.LAZY)  
        @JoinColumn(name = "uploaded_by")  
        private Admin uploadedBy;
         

         
        @ManyToOne(fetch = FetchType.LAZY)  
        @JoinColumn(name = "adviser_id")  
        private Admin adviser;
        @ManyToOne(fetch = FetchType.LAZY)  
        @JoinColumn(name = "faculty_id")  
        private Faculty faculty;
         
        @ManyToOne(fetch = FetchType.LAZY)  
        @JoinColumn(name = "group_id")  
        private Groups group;
         

         
        @ManyToMany
        @JoinTable(name = "sp_students",  
                        joinColumns = @JoinColumn(name = "sp_id"),  
                        inverseJoinColumns = @JoinColumn(name = "student_id")  
                                                                               
        )
        private Set<Student> students = new HashSet<>();
         
        @ManyToMany
        @JoinTable(name = "sp_tags",  
                        joinColumns = @JoinColumn(name = "sp_id"),  
                        inverseJoinColumns = @JoinColumn(name = "tag_id")  
        )
        private Set<Tag> tags = new HashSet<>();
         
         
         
         
         
         
}