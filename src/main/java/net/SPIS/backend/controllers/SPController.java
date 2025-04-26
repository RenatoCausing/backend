package net.SPIS.backend.controllers;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.repositories.SPRepository;
import net.SPIS.backend.service.SPService;

@RestController
@RequestMapping("/api/sp")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SPController {

    private static final Logger logger = LoggerFactory.getLogger(SPController.class);
    @Autowired
    private SPService spService;

    @Autowired
    private SPRepository spRepository;
    // Keep if used directly (like in filterSPs)

    // --- Existing endpoints from Controller Backend.txt ---
    @GetMapping("/{spId}")
    public SPDTO getSP(@PathVariable Integer spId) {
        return spService.getSP(spId);
    }

    @GetMapping
    public List<SPDTO> getAllSP() {
        return spService.getAllSP();
    }

    @GetMapping("/filter")
    public List<SPDTO> filterSPs(
            @RequestParam(required = false) List<Integer> adviserIds,
            @RequestParam(required = false) List<Integer> tagIds,
            @RequestParam(required = false) Integer facultyId,
            @RequestParam(required = false) String searchTerm) {

        logger.debug("Filtering SPs with: adviserIds={}, tagIds={}, facultyId={}, searchTerm={}",
                adviserIds, tagIds, facultyId, searchTerm);

        // Call the new comprehensive filter method in the service layer
        List<SPDTO> results = spService.filterSPs(adviserIds, tagIds, facultyId, searchTerm);
        logger.debug("Filtered SPs count: {}", results.size());
        return results;
    }

    @GetMapping("/adviser/{adviserId}")
    public List<SPDTO> getSPFromAdviser(@PathVariable Integer adviserId) {
        return spService.getSPFromAdviser(adviserId);
    }

    @GetMapping("/student/{studentId}")
    public List<SPDTO> getSPFromStudent(@PathVariable Integer studentId) {
        return spService.getSPFromStudent(studentId);
    }

    @PostMapping("/{spId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Integer spId) {
        spService.incrementViewCount(spId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/faculty/{facultyId}")
    public List<SPDTO> getSPFromFaculty(@PathVariable Integer facultyId) {
        return spService.getSPFromFaculty(facultyId);
    }

    @PostMapping
    public ResponseEntity<SPDTO> createSP(@RequestBody SPDTO spDTO) {
        try {
            SPDTO createdSP = spService.createSP(spDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSP);
        } catch (ResponseStatusException e) {
            logger.error("Error creating SP: {} - {}", e.getStatusCode(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            logger.error("Unexpected error creating SP", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tags")
    public List<SPDTO> getSPsWithTags(@RequestParam(required = false) List<Integer> tagIds) {
        // Now calls the new filterSPs method in the service
        return spService.getSPsWithTags(tagIds);
    }

    @GetMapping("/{spId}/view-count")
    public ResponseEntity<Integer> getSPViewCount(@PathVariable Integer spId) {
        try {
            return ResponseEntity.ok(spService.getSPViewCount(spId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @GetMapping("/top-sps")
    public ResponseEntity<List<SPDTO>> getMostViewedSPs() {
        List<SPDTO> topSPs = spService.getMostViewedSPs(50);
        if (topSPs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(topSPs);
    }

    @GetMapping("/top-advisers")
    public ResponseEntity<List<AdviserDTO>> getTopAdvisersByViews() {
        logger.debug("Endpoint /top-advisers was hit!");
        List<AdviserDTO> topAdvisers = spService.getTopAdvisersByViews();
        if (topAdvisers.isEmpty()) {
            logger.debug("No top advisers found or all have 0 views.");
            return ResponseEntity.noContent().build();
        }

        logger.debug("Returning top advisers: {}", topAdvisers.size());
        return ResponseEntity.ok(topAdvisers);
    }

    @PutMapping("/{spId}/update")
    public ResponseEntity<SPDTO> updateSP(@PathVariable Integer spId, @RequestBody SPDTO spDTO) {
        logger.info("Received update request for SP ID: {}", spId);
        logger.debug("Request body: {}", spDTO);

        try {
            SPDTO updatedSP = spService.updateSP(spId, spDTO);
            return ResponseEntity.ok(updatedSP);
        } catch (ResponseStatusException e) {
            logger.error("Error updating SP {}: {} - {}", spId, e.getStatusCode(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            logger.error("Unexpected error updating SP {}", spId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- New Endpoint for CSV Upload ---
    @PostMapping("/upload-csv")
    public ResponseEntity<Map<String, Object>> uploadSPCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadedById") Integer uploadedById) {
        logger.info("Received request to upload SP CSV by Admin ID: {}", uploadedById);
        if (file.isEmpty()) {
            logger.warn("Upload request failed: No file provided.");
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a CSV file to upload."));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".csv"))) {
            logger.warn("Upload request failed: Invalid filename or extension '{}'. Requires .csv", filename);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type. Please upload a file with a .csv extension."));
        }
        try {
            Map<String, Object> result = spService.processSPUpload(file, uploadedById);
            logger.info("CSV processing completed for admin ID {}. Result: Success={}, Errors={}",
                    uploadedById, result.get("successCount"), result.get("errorCount"));
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            logger.error("IOException during CSV upload processing for admin ID {}", uploadedById, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error reading CSV file: " + e.getMessage()));
        } catch (ResponseStatusException e) {
            logger.error("ResponseStatusException during CSV upload processing for admin ID {}: {} - {}", uploadedById,
                    e.getStatusCode(), e.getReason(), e);
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            logger.error("Unexpected error during CSV upload for admin ID {}", uploadedById, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected server error occurred during upload: " + e.getMessage()));
        }
    }
}