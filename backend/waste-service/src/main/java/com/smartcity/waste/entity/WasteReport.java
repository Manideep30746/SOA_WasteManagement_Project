package com.smartcity.waste.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_reports")
public class WasteReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;

    @Column(length = 1000)
    private String description;

    private String category;
    private String status;
    private LocalDateTime createdAt;

    public WasteReport() {}

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null || status.isBlank()) {
            status = "REPORTED";
        }
    }

    public Long getId() { return id; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() {
    return status;
}
    public void setStatus(String status) {
    this.status = status;
}
    public LocalDateTime getCreatedAt() { return createdAt; }
}
