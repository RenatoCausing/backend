package net.SPIS.backend.service;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.entities.Admin;

import java.util.List;

public interface AdviserService {
    List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId);

    List<AdviserDTO> getAllAdvisers();

    AdviserDTO getAdviser(Integer adviserId);

    AdviserDTO getAdviserFromSP(Integer spId);

    AdviserDTO updateAdviser(Integer adviserId, AdviserDTO adviserDTO);

    AdviserDTO updateAdviserDescription(Integer adviserId, String description);

    AdviserDTO updateAdviserImage(Integer adviserId, String imagePath);

    // Methods for UserManagementPanel
    List<AdviserDTO> getAllUsers();

    List<AdviserDTO> getUsersByFaculty(Integer facultyId);

    List<AdviserDTO> getUsersByRole(String role);

    List<AdviserDTO> getUsersByFacultyAndRole(Integer facultyId, String role);

    List<AdviserDTO> searchUsers(String searchTerm);

    AdviserDTO createUser(Admin adminData);

    AdviserDTO updateUser(Integer adminId, AdviserDTO adviserDTO);

    void deleteUser(Integer adminId);

    AdviserDTO toDTO(Admin admin);
}