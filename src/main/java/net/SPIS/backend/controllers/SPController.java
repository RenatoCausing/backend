package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sp")
public class SPController {

    @Autowired
    private SPService spService;

    @GetMapping("/{spId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public SPDTO getSP(@PathVariable Integer spId) {
        return spService.getSP(spId);
    }

    @GetMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public List<SPDTO> getAllSP() {
        return spService.getAllSP();
    }

    @GetMapping("/adviser/{adviserId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<SPDTO> getSPFromAdviser(@PathVariable Integer adviserId) {
        return spService.getSPFromAdviser(adviserId);
    }

    @GetMapping("/student/{studentId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<SPDTO> getSPFromStudent(@PathVariable Integer studentId) {
        return spService.getSPFromStudent(studentId);
    }

    @PostMapping("/{spId}/view")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Integer spId) {
        spService.incrementViewCount(spId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/faculty/{facultyId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<SPDTO> getSPFromFaculty(@PathVariable Integer facultyId) {
        return spService.getSPFromFaculty(facultyId);
    }

    @PostMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public SPDTO createSP(@RequestBody SPDTO spDTO) {
        return spService.createSP(spDTO);
    }

    /**
     * Update an existing SP
     * @param spId The ID of the SP to update
     * @param spDTO Updated SP data
     * @return The updated SP data
     */
    @PutMapping("/{spId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<SPDTO> updateSP(@PathVariable Integer spId, @RequestBody SPDTO spDTO) {
        System.out.println("📝 Updating SP with ID: " + spId);
        SPDTO updatedSP = spService.updateSP(spId, spDTO);
        return ResponseEntity.ok(updatedSP);
    }

    /**
     * Delete an SP by ID
     * @param spId The ID of the SP to delete
     * @return Empty response with status code
     */
    @DeleteMapping("/{spId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Void> deleteSP(@PathVariable Integer spId) {
        System.out.println("🗑️ Deleting SP with ID: " + spId);
        spService.deleteSP(spId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Add a tag to an SP
     * @param spId The ID of the SP
     * @param tagId The ID of the tag to add
     * @return Updated SP data with the new tag
     */
    @PostMapping("/{spId}/tags/{tagId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<SPDTO> addTagToSP(@PathVariable Integer spId, @PathVariable Integer tagId) {
        System.out.println("🏷️ Adding tag " + tagId + " to SP " + spId);
        SPDTO updatedSP = spService.addTagToSP(spId, tagId);
        return ResponseEntity.ok(updatedSP);
    }

    /**
     * Remove a tag from an SP
     * @param spId The ID of the SP
     * @param tagId The ID of the tag to remove
     * @return Updated SP data without the removed tag
     */
    @DeleteMapping("/{spId}/tags/{tagId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<SPDTO> removeTagFromSP(@PathVariable Integer spId, @PathVariable Integer tagId) {
        System.out.println("🏷️ Removing tag " + tagId + " from SP " + spId);
        SPDTO updatedSP = spService.removeTagFromSP(spId, tagId);
        return ResponseEntity.ok(updatedSP);
    }

    /**
     * Update multiple tags for an SP at once
     * @param spId The ID of the SP
     * @param tagIds List of tag IDs to set for the SP
     * @return Updated SP data with the new set of tags
     */
    @PutMapping("/{spId}/tags")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<SPDTO> updateSPTags(@PathVariable Integer spId, @RequestBody List<Integer> tagIds) {
        System.out.println("🏷️ Updating all tags for SP " + spId);
        SPDTO updatedSP = spService.updateSPTags(spId, tagIds);
        return ResponseEntity.ok(updatedSP);
    }

    /**
     * Search for SPs by title, abstract, or authors
     * @param query The search term
     * @return List of SPs matching the search criteria
     */
    @GetMapping("/search")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<List<SPDTO>> searchSPs(@RequestParam String query) {
        System.out.println("🔍 Searching for SPs with query: " + query);
        List<SPDTO> results = spService.searchSPs(query);
        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }
    
    /**
     * Advanced search with multiple filters
     * @param title Optional title filter
     * @param author Optional author filter
     * @param adviser Optional adviser filter
     * @param year Optional year filter
     * @param semester Optional semester filter
     * @param tagIds Optional list of tag IDs
     * @return List of SPs matching all provided filters
     */
    @GetMapping("/advanced-search")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<List<SPDTO>> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String adviser,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) List<Integer> tagIds) {
        
        System.out.println("🔍 Advanced search with filters");
        List<SPDTO> results = spService.advancedSearch(title, author, adviser, year, semester, tagIds);
        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/tags")
    public List<SPDTO> getSPsWithTags(@RequestParam(required = false) List<Integer> tagIds) {
        return spService.getSPsWithTags(tagIds);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/{spId}/view-count")
    public ResponseEntity<Integer> getSPViewCount(@PathVariable Integer spId) {
        return ResponseEntity.ok(spService.getSPViewCount(spId));
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/top-sps")
    public ResponseEntity<List<SPDTO>> getMostViewedSPs() {
        List<SPDTO> topSPs = spService.getMostViewedSPs(5);
        if (topSPs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(topSPs);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/top-advisers")
    public ResponseEntity<List<AdviserDTO>> getTopAdvisersByViews() { // ✅ FIXED: No @Override
        System.out.println("🔍 Endpoint /top-advisers was hit!");

        List<AdviserDTO> topAdvisers = spService.getTopAdvisersByViews();

        if (topAdvisers.isEmpty()) {
            System.out.println("⚠️ No advisers found!");
            return ResponseEntity.noContent().build();
        }

        System.out.println("✅ Returning top advisers: " + topAdvisers);
        return ResponseEntity.ok(topAdvisers);
    }
}