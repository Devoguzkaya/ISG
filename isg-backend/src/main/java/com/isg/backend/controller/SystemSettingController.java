package com.isg.backend.controller;

import com.isg.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    public Map<String, String> getSettings() {
        return systemSettingService.getAllSettings();
    }

    @PostMapping
    public void updateSettings(@RequestBody Map<String, String> settings) {
        systemSettingService.updateSettings(settings);
    }
}
