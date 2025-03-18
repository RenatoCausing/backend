package net.SPIS.backend.DTO;

import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
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
}