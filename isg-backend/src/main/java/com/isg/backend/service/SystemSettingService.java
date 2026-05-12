package com.isg.backend.service;

import com.isg.backend.model.SystemSetting;
import com.isg.backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public Map<String, String> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    public void updateSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> {
            SystemSetting setting = systemSettingRepository.findByKey(key)
                    .orElse(SystemSetting.builder().key(key).build());
            setting.setValue(value);
            systemSettingRepository.save(setting);
        });
    }

    public String getSetting(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }
}
