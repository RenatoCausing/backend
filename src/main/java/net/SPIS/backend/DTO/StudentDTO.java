package net.SPIS.backend.DTO;

import lombok.Data;

@Data
public class StudentDTO {
    private Integer studentId;
    private String firstName;
    private String lastName;
    private String middleName;
    private Integer facultyId;
    private Integer groupId;
}