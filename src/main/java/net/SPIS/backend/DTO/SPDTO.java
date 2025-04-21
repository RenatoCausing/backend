package net.SPIS.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;
import java.util.List;

@Data
@AllArgsConstructor // ✅ Auto-generates constructor with all fields
@NoArgsConstructor // ✅ Auto-generates no-arg constructor
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
    private Integer groupId;
    private Integer adviserId;
    private Set<Integer> tagIds; // References tags via SP_Tags
    private Integer viewCount; // ✅ Add view count
    private List<Integer> studentIds; // Add this field
}
