package net.SPIS.backend.service;

import net.SPIS.backend.DTO.StudentDTO;

import java.util.List;

public interface StudentService {
    List<StudentDTO> getAllStudentsFromFaculty(Integer facultyId);

    List<StudentDTO> getAllStudents();

    StudentDTO createStudent(StudentDTO studentDTO);

    void deleteStudent(Integer studentId);

    StudentDTO getStudent(Integer studentId);

    List<StudentDTO> getStudentsByGroupId(Integer groupId);
}