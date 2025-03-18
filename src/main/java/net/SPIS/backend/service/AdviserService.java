package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;

import java.util.List;

public interface AdviserService {
    List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId);

    List<AdviserDTO> getAllAdvisers();

    AdviserDTO getAdviser(Integer adviserId);

    AdviserDTO getAdviserFromSP(Integer spId);
}