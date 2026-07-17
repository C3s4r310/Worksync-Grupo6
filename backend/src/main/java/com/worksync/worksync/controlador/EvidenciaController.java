package com.worksync.worksync.controlador;

import com.worksync.worksync.Servicio.tareaSERVICIO;
import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.model.Tarea;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tareas/{tareaId}/evidencias")
@CrossOrigin(origins = "*")
public class EvidenciaController {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private tareaSERVICIO tareaServicio;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> subirEvidenciaArchivo(
            @PathVariable Long tareaId,
            @RequestParam("file") MultipartFile file) {
        try {
            Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(tareaId)
                    .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + tareaId));

            if (file.isEmpty()) {
                return new ResponseEntity<>("El archivo está vacío.", HttpStatus.BAD_REQUEST);
            }

            // Crear el directorio si no existe
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generar un nombre único para el archivo
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            Path path = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(path, file.getBytes());

            // La URL estática será expuesta en /uploads/
            String fileUrl = "http://localhost:8080/uploads/" + newFilename;

            // Agregar la evidencia a la tarea y guardar a través del servicio
            tareaServicio.agregarEvidencia(tareaId, fileUrl);

            return new ResponseEntity<>(Map.of("url", fileUrl), HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Error al guardar el archivo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/url")
    public ResponseEntity<?> agregarEvidenciaUrl(
            @PathVariable Long tareaId,
            @RequestBody Map<String, String> body) {
        try {
            String url = body.get("url");
            if (url == null || url.trim().isEmpty()) {
                return new ResponseEntity<>("La URL es obligatoria.", HttpStatus.BAD_REQUEST);
            }

            Tarea tarea = tareaServicio.agregarEvidencia(tareaId, url);
            return new ResponseEntity<>(tarea, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
