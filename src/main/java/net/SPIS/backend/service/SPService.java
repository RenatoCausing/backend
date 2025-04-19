package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;

import java.util.List;

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
    
    // Missing methods that need to be added:
    SPDTO updateSP(Integer spId, SPDTO spDTO);
    
    void deleteSP(Integer spId);
    
    SPDTO addTagToSP(Integer spId, Integer tagId);
    
    SPDTO removeTagFromSP(Integer spId, Integer tagId);
    
    SPDTO updateSPTags(Integer spId, List<Integer> tagIds);
    
    List<SPDTO> searchSPs(String query);
    
    List<SPDTO> advancedSearch(String title, String author, String adviser, String year, String semester, List<Integer> tagIds);
}