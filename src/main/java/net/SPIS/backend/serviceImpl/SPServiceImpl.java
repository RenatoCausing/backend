package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.*;
import net.SPIS.backend.entities.*;
import net.SPIS.backend.repositories.*;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

import javax.management.relation.RelationNotFoundException;

@Service
public class SPServiceImpl implements SPService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private SPRepository spRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private GroupsRepository groupsRepository;

    @Autowired
    private TagRepository tagRepository;

    @Override
    public SPDTO getSP(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));

        incrementViewCount(spId); // ✅ Increment view count when SP is retrieved

        return toDTO(sp);
    }

    @Override
    public List<SPDTO> getAllSP() {
        return spRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromAdviser(Integer adviserId) {
        return spRepository.findByAdviserAdminId(adviserId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromStudent(Integer studentId) {
        return spRepository.findByGroupStudentsStudentId(studentId).stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromFaculty(Integer facultyId) {
        List<Groups> groups = groupsRepository.findByStudentsFacultyFacultyId(facultyId);
        // Example logic: Fetch SPs linked to these groups
        return spRepository.findByGroupStudentsFacultyFacultyId(facultyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SPDTO createSP(SPDTO spDTO) {
        SP sp = new SP();
        sp.setTitle(spDTO.getTitle());
        sp.setYear(spDTO.getYear());
        sp.setSemester(spDTO.getSemester());
        sp.setAbstractText(spDTO.getAbstractText());
        sp.setUri(spDTO.getUri());
        sp.setDocumentPath(spDTO.getDocumentPath());
        sp.setDateIssued(spDTO.getDateIssued());
        sp.setViewCount(0);
        // Validate and set uploadedBy (must be staff)
        Admin uploadedBy = adminRepository.findById(spDTO.getUploadedById())
                .orElseThrow(() -> new RuntimeException("Uploader not found"));
        if (!"staff".equals(uploadedBy.getRole())) {
            throw new RuntimeException("Uploader must be a staff member");
        }
        sp.setUploadedBy(uploadedBy);

        // Set group
        sp.setGroup(groupsRepository.findById(spDTO.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found")));

        // Validate and set adviser (must be faculty)
        Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                .orElseThrow(() -> new RuntimeException("Adviser not found"));
        if (!"faculty".equals(adviser.getRole())) {
            throw new RuntimeException("Adviser must be a faculty member");
        }
        sp.setAdviser(adviser);

        // Set tags from SP_Tags (if provided)
        if (spDTO.getTagIds() != null && !spDTO.getTagIds().isEmpty()) {
            sp.setTags(spDTO.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Tag not found: " + id)))
                    .collect(Collectors.toSet()));
        }

        return toDTO(spRepository.save(sp));
    }

    @Override
    public List<SPDTO> getSPsWithTags(List<Integer> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return getAllSP();
        }
        return spRepository.findByTagsTagIdIn(tagIds).stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * ✅ Increment SP view count when accessed.
     */
    @Override
    @Transactional
    public void incrementViewCount(Integer spId) {
        spRepository.incrementViewCountById(spId);
    }

    /**
     * ✅ Get the top most viewed SPs
     */
    @Override
    public List<SPDTO> getMostViewedSPs(Integer limit) {
        PageRequest pageable = PageRequest.of(0, 5); // Get 'limit' results from page 0
        return spRepository.findTopSPs(pageable).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private SPDTO toDTO(SP sp) {
        SPDTO dto = new SPDTO();
        dto.setSpId(sp.getSpId());
        dto.setTitle(sp.getTitle());
        dto.setYear(sp.getYear());
        dto.setSemester(sp.getSemester());
        dto.setAbstractText(sp.getAbstractText());
        dto.setUri(sp.getUri());
        dto.setDocumentPath(sp.getDocumentPath());
        dto.setDateIssued(sp.getDateIssued());
        dto.setUploadedById(sp.getUploadedBy().getAdminId());
        dto.setGroupId(sp.getGroup().getGroupId());
        dto.setAdviserId(sp.getAdviser().getAdminId());
        dto.setTagIds(sp.getTags().stream().map(Tag::getTagId).collect(Collectors.toSet()));
        dto.setViewCount(sp.getViewCount());
        return dto;
    }

    @Override
    public Integer getSPViewCount(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        return sp.getViewCount();
    }

    @Override
    public List<AdviserDTO> getTopAdvisersByViews() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Object[]> results = spRepository.findTopAdvisersByViews(pageable);

        return results.stream()
                .filter(result -> result[1] != null && (Long) result[1] > 0) // Remove 0-view advisers
                .map(result -> {
                    Admin adviser = (Admin) result[0];
                    AdviserDTO dto = new AdviserDTO();
                    dto.setAdminId(adviser.getAdminId());
                    dto.setFirstName(adviser.getFirstName());
                    dto.setLastName(adviser.getLastName());
                    dto.setMiddleName(adviser.getMiddleName());
                    dto.setFacultyId(adviser.getFaculty().getFacultyId());
                    dto.setImagePath(adviser.getImagePath());
                    dto.setDescription(adviser.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setMiddleName(student.getMiddleName());
        dto.setFacultyId(student.getFaculty().getFacultyId());
        dto.setGroupId(student.getGroup() != null ? student.getGroup().getGroupId() : null);
        return dto;
    }

}