package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}