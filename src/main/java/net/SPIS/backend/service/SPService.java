package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.DTO.StudentDTO;
import net.SPIS.backend.DTO.TagDTO;

import java.util.List;
import java.util.Set;

public interface SPService {
    SPDTO getSP(Integer spId);

    List<SPDTO> getAllSP();

    List<SPDTO> getSPFromAdviser(Integer adviserId);

    List<SPDTO> getSPFromStudent(Integer studentId);

    List<SPDTO> getSPFromFaculty(Integer facultyId);

    SPDTO createSP(SPDTO spDTO);

    List<SPDTO> getSPsWithTags(List<Integer> tagIds);
    
    void incrementViewCount(Integer spId);

    Integer getSPViewCount(Integer spId);

    List<SPDTO> getMostViewedSPs(Integer limit);

    List<AdviserDTO> getTopAdvisersByViews();
    
    SPDTO updateSP(Integer spId, SPDTO spDTO);
    
    List<String> getStudentNamesByGroupId(Integer groupId);
    
    String getAdviserNameById(Integer adviserId);
    
    List<String> getTagNamesBySpId(Integer spId);
}