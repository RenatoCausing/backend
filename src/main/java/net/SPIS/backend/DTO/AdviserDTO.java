package net.SPIS.backend.DTO;

import lombok.Data;

@Data
public class AdviserDTO {
    private Integer adminId;
    private String firstName;
    private String lastName;
    private String middleName;
    private Integer facultyId;
}