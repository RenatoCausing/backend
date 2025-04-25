package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface SPService {

    SPDTO getSP(Integer spId);

    // Modified to return a Page of SPDTOs
    Page<SPDTO> getAllSP(Pageable pageable);

    // Modified to return a Page of SPDTOs
    Page<SPDTO> getSPFromAdviser(Integer adviserId, Pageable pageable);

    // Modified to return a Page of SPDTOs
    Page<SPDTO> getSPFromStudent(Integer studentId, Pageable pageable);

    // Modified to return a Page of SPDTOs
    Page<SPDTO> getSPFromFaculty(Integer facultyId, Pageable pageable);

    SPDTO createSP(SPDTO spDTO);

    // Modified to return a Page of SPDTOs
    Page<SPDTO> getSPsWithTags(List<Integer> tagIds, Pageable pageable);

    void incrementViewCount(Integer spId);

    List<SPDTO> getMostViewedSPs(Integer limit); // This can remain List if you only need top N

    Integer getSPViewCount(Integer spId);

    List<AdviserDTO> getTopAdvisersByViews(); // This can remain List if you only need top N

    SPDTO updateSP(Integer spId, SPDTO spDTO);

    Map<String, Object> processSPUpload(MultipartFile file, Integer uploadedById) throws IOException;

    // New method for filtering with pagination
    Page<SPDTO> filterSPs(List<Integer> adviserIds, List<Integer> tagIds, Integer facultyId, String searchTerm, Pageable pageable);
}
