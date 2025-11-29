/**
 * 版本号工具类
 */
import { VersionUpdateType } from '../types/version';

/**
 * 版本号工具
 */
export class VersionUtils {
    /**
     * 递增版本号
     * @param currentVersion 当前版本号（例如: "0.0.3"）
     * @param type 递增类型
     * @returns 新版本号
     */
    public static incrementVersion(currentVersion: string, type: VersionUpdateType): string {
        const parts = currentVersion.split('.').map(Number);

        if (parts.length !== 3 || parts.some(isNaN)) {
            throw new Error(`版本号格式不正确: ${currentVersion}，应为 x.y.z 格式`);
        }

        switch (type) {
            case VersionUpdateType.Major:
                parts[0]++;
                parts[1] = 0;
                parts[2] = 0;
                break;
            case VersionUpdateType.Minor:
                parts[1]++;
                parts[2] = 0;
                break;
            case VersionUpdateType.Patch:
            default:
                parts[2]++;
                break;
        }

        return parts.join('.');
    }

    /**
     * 验证版本号格式
     * @param version 版本号
     * @returns 是否为有效格式
     */
    public static validateVersion(version: string): boolean {
        const versionPattern = /^\d+\.\d+\.\d+$/;
        return versionPattern.test(version);
    }

    /**
     * 从文本中提取版本号
     * @param content 文本内容
     * @param regexPattern 正则表达式模式（字符串）
     * @returns 提取到的版本号，如果未找到则返回 null
     */
    public static extractVersion(content: string, regexPattern: string): string | null {
        try {
            const regex = new RegExp(regexPattern);
            const match = content.match(regex);

            if (!match) {
                return null;
            }

            // 尝试从匹配结果中提取版本号
            // 如果正则表达式有捕获组，优先使用第一个捕获组
            // 否则使用整个匹配结果
            let version = match[1] || match[0];

            // 进一步提取版本号（x.y.z 格式）
            const versionMatch = version.match(/\d+\.\d+\.\d+/);
            if (versionMatch) {
                return versionMatch[0];
            }

            return null;
        } catch (error) {
            throw new Error(`正则表达式无效: ${regexPattern}`);
        }
    }
}

