package net.SPIS.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SPDTO {
    private Integer spId;
    private String title;
    private Integer year;
    private String semester;
    private String abstractText;
    private String uri;
    private String documentPath;
    private LocalDate dateIssued;
    private Integer uploadedById;
    private Integer facultyId;
    // REMOVE groupId since SP is no longer directly linked to a single Group for
    // students
    // private Integer groupId;
    private Integer adviserId;
    private Set<Integer> tagIds;
    private Integer viewCount;

    // Keep these as they represent the students in the Many-to-Many relationship
    private List<Integer> studentIds;
    private List<String> authors;
}