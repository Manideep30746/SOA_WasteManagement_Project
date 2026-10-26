
package com.smartcity.waste.repository;

import com.smartcity.waste.entity.WasteReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteReportRepository
        extends JpaRepository<WasteReport, Long> {
}
