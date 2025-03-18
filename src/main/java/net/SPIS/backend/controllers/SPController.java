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
    public SPDTO getSP(@PathVariable Integer spId) {
        return spService.getSP(spId);
    }

    @GetMapping
    public List<SPDTO> getAllSP() {
        return spService.getAllSP();
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
    public SPDTO createSP(@RequestBody SPDTO spDTO) {
        return spService.createSP(spDTO);
    }

    @GetMapping("/tags")
    public List<SPDTO> getSPsWithTags(@RequestParam(required = false) List<Integer> tagIds) {
        return spService.getSPsWithTags(tagIds);
    }

    @GetMapping("/{spId}/view-count")
    public ResponseEntity<Integer> getSPViewCount(@PathVariable Integer spId) {
        return ResponseEntity.ok(spService.getSPViewCount(spId));
    }

    @GetMapping("/top-sps")
    public ResponseEntity<List<SPDTO>> getMostViewedSPs() {
        List<SPDTO> topSPs = spService.getMostViewedSPs(5);
        if (topSPs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(topSPs);
    }

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