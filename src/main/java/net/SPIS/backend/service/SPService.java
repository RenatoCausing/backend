package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.DTO.StudentDTO;

import java.util.List;

import javax.management.relation.RelationNotFoundException;

public interface SPService {
    SPDTO getSP(Integer spId);

    List<SPDTO> getAllSP();

    List<SPDTO> getSPFromAdviser(Integer adviserId);

    List<SPDTO> getSPFromStudent(Integer studentId);

    List<SPDTO> getSPFromFaculty(Integer facultyId);

    SPDTO createSP(SPDTO spDTO);

    List<SPDTO> getSPsWithTags(List<Integer> tagIds);

    // ✅ NEW: Increment View Count
    void incrementViewCount(Integer spId);

    // ✅ NEW: Get Most Viewed SPs
    List<SPDTO> getMostViewedSPs(Integer limit);

    Integer getSPViewCount(Integer spId);

    List<AdviserDTO> getTopAdvisersByViews();

}