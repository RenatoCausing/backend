package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;

import java.util.List;

public interface AdviserService {
    List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId);

    List<AdviserDTO> getAllAdvisers();

    AdviserDTO getAdviser(Integer adviserId);

    AdviserDTO getAdviserFromSP(Integer spId);

    // New methods for updating image and description
    AdviserDTO updateAdviserDescription(Integer adviserId, String description);

    AdviserDTO updateAdviserImage(Integer adviserId, String imagePath);
}