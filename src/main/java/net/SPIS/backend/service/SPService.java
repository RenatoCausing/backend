package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
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

    List<SPDTO> getMostViewedSPs(Integer limit);

    Integer getSPViewCount(Integer spId);

    List<AdviserDTO> getTopAdvisersByViews();

    SPDTO updateSP(Integer spId, SPDTO spDTO);

    Map<String, Object> processSPUpload(MultipartFile file, Integer uploadedById) throws IOException;

    List<SPDTO> filterSPs(List<Integer> adviserIds, List<Integer> tagIds, Integer facultyId, String searchTerm);

     
    void deleteSP(Integer spId);
}
