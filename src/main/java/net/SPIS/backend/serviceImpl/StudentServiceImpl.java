package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.StudentDTO;
import net.SPIS.backend.entities.Faculty;
// REMOVE Groups import
// import net.SPIS.backend.entities.Groups;
import net.SPIS.backend.entities.Student;
import net.SPIS.backend.repositories.FacultyRepository;
// REMOVE GroupsRepository import
// import net.SPIS.backend.repositories.GroupsRepository;
import net.SPIS.backend.repositories.StudentRepository;
import net.SPIS.backend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    // REMOVE GroupsRepository
    // @Autowired
    // private GroupsRepository groupsRepository;

    @Override
    public List<StudentDTO> getAllStudentsFromFaculty(Integer facultyId) {
        return studentRepository.findByFacultyFacultyId(facultyId).stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public StudentDTO createStudent(StudentDTO studentDTO) {
        Student student = new Student();
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setMiddleName(studentDTO.getMiddleName());

        student.setFaculty(facultyRepository.findById(studentDTO.getFacultyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Faculty not found with id " + studentDTO.getFacultyId())));

        // No longer setting group for student

        return toDTO(studentRepository.save(student));
    }

    @Override
    public void deleteStudent(Integer studentId) {
        studentRepository.deleteById(studentId);
    }

    @Override
    public StudentDTO getStudent(Integer studentId) {
        return toDTO(studentRepository.findById(studentId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with id " + studentId)));
    }

    // REMOVED: getStudentsByGroupId method

    // Updated toDTO method (from previous turns)
    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setMiddleName(student.getMiddleName());

        if (student.getFaculty() != null) {
            dto.setFacultyId(student.getFaculty().getFacultyId());
        }

        // GroupId is no longer part of StudentDTO in this model
        // dto.setGroupId(student.getGroup() != null ? student.getGroup().getGroupId() :
        // null);

        return dto;
    }
}