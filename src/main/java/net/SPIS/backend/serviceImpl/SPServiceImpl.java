package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.DTO.StudentDTO;
import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.entities.SP;
import net.SPIS.backend.entities.Student;
import net.SPIS.backend.entities.Tag;
import net.SPIS.backend.repositories.AdminRepository;
import net.SPIS.backend.repositories.SPRepository;
import net.SPIS.backend.repositories.StudentRepository;
import net.SPIS.backend.repositories.TagRepository;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SPServiceImpl implements SPService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SPRepository spRepository;

    @Autowired
    private AdminRepository adminRepository;

    // REMOVE GroupsRepository
    // @Autowired
    // private GroupsRepository groupsRepository;

    @Autowired
    private TagRepository tagRepository;

    @Override
    public SPDTO getSP(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        incrementViewCount(spId);

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
        return spRepository.findByStudentsStudentId(studentId).stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    // ✅ REIMPLEMENTED: getSPFromFaculty using the new Many-to-Many relationship
    public List<SPDTO> getSPFromFaculty(Integer facultyId) {
        // Use the new repository method to find SPs linked to students of the given
        // faculty
        return spRepository.findByAdviserFacultyId(facultyId).stream()
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

        Admin uploadedBy = adminRepository.findById(spDTO.getUploadedById())
                .orElseThrow(() -> new RuntimeException("Uploader not found"));
        if (!"staff".equals(uploadedBy.getRole())) {
            throw new RuntimeException("Uploader must be a staff member");
        }
        sp.setUploadedBy(uploadedBy);

        Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                .orElseThrow(() -> new RuntimeException("Adviser not found"));
        if (!"faculty".equals(adviser.getRole())) {
            throw new RuntimeException("Adviser must be a faculty member");
        }
        sp.setAdviser(adviser);

        // Set tags
        if (spDTO.getTagIds() != null && !spDTO.getTagIds().isEmpty()) {
            sp.setTags(spDTO.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Tag not found: " + id)))
                    .collect(Collectors.toSet()));
        } else {
            sp.setTags(new HashSet<>()); // Ensure tags is not null if no tags are provided
        }

        // Set students from studentIds in the DTO
        if (spDTO.getStudentIds() != null && !spDTO.getStudentIds().isEmpty()) {
            Set<Student> students = spDTO.getStudentIds().stream()
                    .map(id -> studentRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Student not found: " + id)))
                    .collect(Collectors.toSet());
            sp.setStudents(students);
        } else {
            sp.setStudents(new HashSet<>()); // Ensure students is not null if no students are provided
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

    @Override
    @Transactional
    public void incrementViewCount(Integer spId) {
        spRepository.incrementViewCountById(spId);
    }

    @Override
    public List<SPDTO> getMostViewedSPs(Integer limit) {
        PageRequest pageable = PageRequest.of(0, 5);
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
        dto.setViewCount(sp.getViewCount() != null ? sp.getViewCount() : 0);

        if (sp.getUploadedBy() != null) {
            dto.setUploadedById(sp.getUploadedBy().getAdminId());
        }

        // Extract student information from the Many-to-Many relationship
        List<Integer> studentIds = new ArrayList<>();
        List<String> authors = new ArrayList<>();
        if (sp.getStudents() != null && !sp.getStudents().isEmpty()) {
            for (Student student : sp.getStudents()) {
                if (student != null) {
                    studentIds.add(student.getStudentId());

                    String lastName = student.getLastName() != null ? student.getLastName() : "";
                    String firstName = student.getFirstName() != null ? student.getFirstName() : "";
                    String authorName = lastName;
                    if (!firstName.isEmpty()) {
                        authorName += ", " + firstName;
                    }
                    authors.add(authorName);
                }
            }
        }
        dto.setStudentIds(studentIds);
        dto.setAuthors(authors);

        if (sp.getAdviser() != null) {
            dto.setAdviserId(sp.getAdviser().getAdminId());
        }

        Set<Integer> tagIds = new HashSet<>();
        if (sp.getTags() != null) {
            tagIds = sp.getTags().stream()
                    .filter(Objects::nonNull)
                    .map(Tag::getTagId)
                    .collect(Collectors.toSet());
        }
        dto.setTagIds(tagIds);

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
                    // Assuming Admin has a Faculty relationship
                    // dto.setFacultyId(adviser.getFaculty().getFacultyId());
                    dto.setImagePath(adviser.getImagePath());
                    dto.setDescription(adviser.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Keep StudentDTO conversion if needed elsewhere
    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setMiddleName(student.getMiddleName());
        // Assuming Student has a Faculty relationship
        dto.setFacultyId(student.getFaculty().getFacultyId());
        return dto;
    }

    @Override
    @Transactional
    public SPDTO updateSP(Integer spId, SPDTO spDTO) {
        System.out.println("Updating SP with ID: " + spId);
        System.out.println("Received DTO: " + spDTO);

        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));

        if (spDTO.getTitle() != null) {
            sp.setTitle(spDTO.getTitle());
        }
        if (spDTO.getYear() != null) {
            sp.setYear(spDTO.getYear());
        }
        if (spDTO.getSemester() != null) {
            sp.setSemester(spDTO.getSemester());
        }
        if (spDTO.getAbstractText() != null) {
            sp.setAbstractText(spDTO.getAbstractText());
        }
        if (spDTO.getDocumentPath() != null) {
            sp.setDocumentPath(spDTO.getDocumentPath());
        }

        if (spDTO.getAdviserId() != null) {
            System.out.println("Updating adviser with ID: " + spDTO.getAdviserId());
            Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Adviser not found with ID: " + spDTO.getAdviserId()));
            sp.setAdviser(adviser);
        }

        // Update tags (existing logic)
        Set<Integer> tagIds = spDTO.getTagIds();
        if (tagIds != null) {
            System.out.println("Updating tags: " + tagIds);
            Set<Tag> tags = new HashSet<>();
            for (Integer tagId : tagIds) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Tag with ID " + tagId + " not found"));
                tags.add(tag);
            }
            sp.setTags(tags);
        } else {
            sp.setTags(new HashSet<>()); // Clear tags if none provided
            System.out.println("No tags provided in update, clearing existing tags");
        }

        // Update students using the Many-to-Many relationship
        List<Integer> studentIds = spDTO.getStudentIds();
        if (studentIds != null) {
            System.out.println("Updating student authors: " + studentIds);
            Set<Student> students = new HashSet<>();
            for (Integer studentId : studentIds) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Student with ID " + studentId + " not found"));
                students.add(student);
            }
            // JPA automatically manages the join table when you set the collection on the
            // owning side (SP)
            sp.setStudents(students);
        } else {
            sp.setStudents(new HashSet<>()); // Clear students if none provided
            System.out.println("No student authors provided in update, clearing existing students");
        }

        SP savedSP = spRepository.save(sp);
        System.out.println("SP updated successfully");
        SPDTO resultDTO = toDTO(savedSP);
        System.out.println("Returning DTO: " + resultDTO);

        return resultDTO;
    }

}