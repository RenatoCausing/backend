package net.SPIS.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // Generates a no-args constructor
@AllArgsConstructor // Generates an all-args constructor
public class AdviserDTO {
    private Integer adminId;
    private String firstName;
    private String lastName;
    private String middleName;
    private Integer facultyId;
}