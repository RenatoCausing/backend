package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.*;
import net.SPIS.backend.entities.*;
import net.SPIS.backend.repositories.*;
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

    @Autowired
    private GroupsRepository groupsRepository;

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
        student.setFaculty(facultyRepository.findById(studentDTO.getFacultyId()).orElseThrow());
        if (studentDTO.getGroupId() != null) {
            student.setGroup(groupsRepository.findById(studentDTO.getGroupId()).orElseThrow());
        }
        return toDTO(studentRepository.save(student));
    }

    @Override
    public void deleteStudent(Integer studentId) {
        studentRepository.deleteById(studentId);
    }

    @Override
    public StudentDTO getStudent(Integer studentId) {
        return toDTO(studentRepository.findById(studentId).orElseThrow());
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

    @Override
    public List<StudentDTO> getStudentsByGroupId(Integer groupId) {
        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found with id " + groupId));

        List<Student> students = studentRepository.findByGroup(group);
        return students.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}