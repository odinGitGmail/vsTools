/**
 * 配置文件类型定义
 */

/**
 * 文件版本配置项
 */
export interface FileVersionConfig {
    /** 文件路径（相对于项目根目录） */
    path: string;
    /** 用于匹配版本号的正则表达式 */
    versionRegex: string;
    /** 文件描述（可选，用于显示） */
    description?: string;
}

/**
 * 自动更新配置文件结构
 */
export interface AutoUpdateConfig {
    /** 文件配置列表 */
    files: FileVersionConfig[];
}

