package service;

import entity.SystemConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.SystemConfigRepository;

import java.util.List;
import java.util.Optional;

/**
 * 系统配置服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Service
public class SystemConfigService {

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    /**
     * 获取配置值
     *
     * @param configKey 配置键
     * @return 配置值（字符串）
     */
    public Optional<String> getConfigValue(String configKey) {
        return systemConfigRepository.findByConfigKey(configKey)
                .map(SystemConfig::getConfigValue);
    }

    /**
     * 获取配置对象
     */
    public Optional<SystemConfig> getConfig(String configKey) {
        return systemConfigRepository.findByConfigKey(configKey);
    }

    /**
     * 获取配置值，如果不存在返回默认值
     */
    public String getConfigValueOrDefault(String configKey, String defaultValue) {
        return getConfigValue(configKey).orElse(defaultValue);
    }

    /**
     * 获取布尔类型配置值
     */
    public boolean getBooleanConfig(String configKey, boolean defaultValue) {
        Optional<String> value = getConfigValue(configKey);
        if (value.isPresent()) {
            try {
                return Boolean.parseBoolean(value.get());
            } catch (Exception e) {
                log.warn("⚠️ 配置值格式错误，使用默认值: configKey={}, value={}", configKey, value.get());
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * 获取数字类型配置值
     */
    public long getLongConfig(String configKey, long defaultValue) {
        Optional<String> value = getConfigValue(configKey);
        if (value.isPresent()) {
            try {
                return Long.parseLong(value.get());
            } catch (Exception e) {
                log.warn("⚠️ 配置值格式错误，使用默认值: configKey={}, value={}", configKey, value.get());
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * 获取数字类型配置值（int）
     */
    public int getIntConfig(String configKey, int defaultValue) {
        Optional<String> value = getConfigValue(configKey);
        if (value.isPresent()) {
            try {
                return Integer.parseInt(value.get());
            } catch (Exception e) {
                log.warn("⚠️ 配置值格式错误，使用默认值: configKey={}, value={}", configKey, value.get());
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * 设置或更新配置
     */
    @Transactional
    public SystemConfig setConfig(String configKey, String configValue, String configType,
                                  String description, String updatedBy) {
        Optional<SystemConfig> existing = systemConfigRepository.findByConfigKey(configKey);

        SystemConfig config;
        if (existing.isPresent()) {
            config = existing.get();
            config.setConfigValue(configValue);
            config.setConfigType(configType);
            if (description != null) {
                config.setDescription(description);
            }
            config.setUpdatedBy(updatedBy);
        } else {
            config = SystemConfig.builder()
                    .configKey(configKey)
                    .configValue(configValue)
                    .configType(configType)
                    .description(description)
                    .updatedBy(updatedBy)
                    .build();
        }

        return systemConfigRepository.save(config);
    }

    /**
     * 设置字符串配置
     */
    @Transactional
    public SystemConfig setStringConfig(String configKey, String value, String updatedBy) {
        return setConfig(configKey, value, SystemConfig.ConfigType.STRING.name(), null, updatedBy);
    }

    /**
     * 设置布尔配置
     */
    @Transactional
    public SystemConfig setBooleanConfig(String configKey, boolean value, String updatedBy) {
        return setConfig(configKey, String.valueOf(value), SystemConfig.ConfigType.BOOLEAN.name(), null, updatedBy);
    }

    /**
     * 设置数字配置
     */
    @Transactional
    public SystemConfig setLongConfig(String configKey, long value, String updatedBy) {
        return setConfig(configKey, String.valueOf(value), SystemConfig.ConfigType.NUMBER.name(), null, updatedBy);
    }

    /**
     * 删除配置
     */
    @Transactional
    public void deleteConfig(String configKey) {
        systemConfigRepository.deleteByConfigKey(configKey);
    }

    /**
     * 检查配置是否存在
     */
    public boolean configExists(String configKey) {
        return systemConfigRepository.existsByConfigKey(configKey);
    }

    /**
     * 获取所有配置
     */
    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }
}

