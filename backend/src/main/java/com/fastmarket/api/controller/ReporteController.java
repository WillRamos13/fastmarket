package com.fastmarket.api.controller;

import com.fastmarket.api.dto.ReporteDtos;
import com.fastmarket.api.service.AuthTokenService;
import com.fastmarket.api.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reportes")
public class ReporteController {
    private final ReporteService reporteService;
    private final AuthTokenService authTokenService;

    public ReporteController(ReporteService reporteService, AuthTokenService authTokenService) {
        this.reporteService = reporteService;
        this.authTokenService = authTokenService;
    }

    @GetMapping
    public ReporteDtos.ReporteAdminResponse obtener(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        authTokenService.requerirAdmin(authorization);
        return reporteService.generar(desde, hasta);
    }
}
