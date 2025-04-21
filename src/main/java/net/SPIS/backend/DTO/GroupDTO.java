package net.SPIS.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDTO {
    private Integer groupId;
    private String name;
    private List<StudentDTO> students;
}