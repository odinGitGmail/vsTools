/**
 * 版本号相关类型定义
 */

/**
 * 版本号更新类型
 */
export enum VersionUpdateType {
    /** 补丁版本（例如: 0.0.3 -> 0.0.4） */
    Patch = 'patch',
    /** 次版本（例如: 0.0.3 -> 0.1.0） */
    Minor = 'minor',
    /** 主版本（例如: 0.0.3 -> 1.0.0） */
    Major = 'major',
    /** 自定义版本号 */
    Custom = 'custom'
}

/**
 * 文件版本信息
 */
export interface FileVersionInfo {
    /** 文件路径 */
    filePath: string;
    /** 当前版本号 */
    currentVersion: string;
    /** 新版本号 */
    newVersion: string;
    /** 文件配置 */
    config: import('./config').FileVersionConfig;
}

