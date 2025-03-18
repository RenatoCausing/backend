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
    public List<StudentDTO> getAllStudentsFromFaculty(@PathVariable Integer facultyId) {
        return studentService.getAllStudentsFromFaculty(facultyId);
    }

    @GetMapping
    public List<StudentDTO> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PostMapping
    public StudentDTO createStudent(@RequestBody StudentDTO studentDTO) {
        return studentService.createStudent(studentDTO);
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{studentId}")
    public StudentDTO getStudent(@PathVariable Integer studentId) {
        return studentService.getStudent(studentId);
    }
}