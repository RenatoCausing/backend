package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.entities.Admin;

import java.util.List;

public interface AdviserService {
    List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId);

    List<AdviserDTO> getAllAdvisers();

    AdviserDTO getAdviser(Integer adviserId);

    AdviserDTO getAdviserFromSP(Integer spId);

    // New comprehensive update method similar to SPService
    AdviserDTO updateAdviser(Integer adviserId, AdviserDTO adviserDTO);

    // Individual field update methods
    AdviserDTO updateAdviserDescription(Integer adviserId, String description);

    AdviserDTO updateAdviserImage(Integer adviserId, String imagePath);

    AdviserDTO toDTO(Admin admin);
}