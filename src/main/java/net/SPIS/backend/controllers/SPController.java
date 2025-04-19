package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    public ResponseEntity<List<AdviserDTO>> getTopAdvisersByViews() {
        System.out.println("🔍 Endpoint /top-advisers was hit!");

        List<AdviserDTO> topAdvisers = spService.getTopAdvisersByViews();

        if (topAdvisers.isEmpty()) {
            System.out.println("⚠️ No advisers found!");
            return ResponseEntity.noContent().build();
        }

        System.out.println("✅ Returning top advisers: " + topAdvisers);
        return ResponseEntity.ok(topAdvisers);
    }

    // Add these methods to your existing SPController class

    @PutMapping("/{spId}/update")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<SPDTO> updateSP(@PathVariable Integer spId, @RequestBody SPDTO spDTO) {
        SPDTO updatedSP = spService.updateSP(spId, spDTO);
        return ResponseEntity.ok(updatedSP);
    }
}