package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.StudentDTO;
import net.SPIS.backend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/faculty/{facultyId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<StudentDTO> getAllStudentsFromFaculty(@PathVariable Integer facultyId) {
        return studentService.getAllStudentsFromFaculty(facultyId);
    }

    @GetMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public List<StudentDTO> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PostMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public StudentDTO createStudent(@RequestBody StudentDTO studentDTO) {
        return studentService.createStudent(studentDTO);
    }

    @DeleteMapping("/{studentId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{studentId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public StudentDTO getStudent(@PathVariable Integer studentId) {
        return studentService.getStudent(studentId);
    }

    @GetMapping("/group/{groupId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<StudentDTO> getStudentsByGroupId(@PathVariable Integer groupId) {
        return studentService.getStudentsByGroupId(groupId);
    }
}