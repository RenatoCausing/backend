package net.SPIS.backend.service;

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
}