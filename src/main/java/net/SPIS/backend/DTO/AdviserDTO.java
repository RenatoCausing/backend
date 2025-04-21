package net.SPIS.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdviserDTO {
    private Integer adminId;
    private String firstName;
    private String lastName;
    private String middleName;
    private Integer facultyId;
    private String email;
    private String imagePath;
    private String description;
    private String role; // Added role field to support UserManagementPanel
}