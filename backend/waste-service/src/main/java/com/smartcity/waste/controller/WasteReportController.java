package com.smartcity.waste.controller;

import com.smartcity.waste.entity.WasteReport;
import com.smartcity.waste.repository.WasteReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waste")
@CrossOrigin(origins = "*")
public class WasteReportController {

    private final WasteReportRepository repository;

    public WasteReportController(WasteReportRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<WasteReport> createReport(
            @RequestBody WasteReport report) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repository.save(report));
    }

    @GetMapping
    public List<WasteReport> getAllReports() {
        return repository.findAll();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (status == null ||
                !List.of("REPORTED", "IN_PROGRESS", "RESOLVED")
                        .contains(status)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid report status"));
        }

        return repository.findById(id)
                .map(report -> {
                    report.setStatus(status);
                    return ResponseEntity.ok(repository.save(report));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}