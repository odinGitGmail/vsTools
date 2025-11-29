/**
 * 文件版本服务
 */
import * as fs from 'fs';
import * as path from 'path';
import { FileVersionConfig } from '../types/config';
import { FileVersionInfo, VersionUpdateType } from '../types/version';
import { VersionUtils } from '../utils/versionUtils';

/**
 * 文件版本服务类
 */
export class FileVersionService {
    /**
     * 读取文件内容
     * @param filePath 文件路径
     * @returns 文件内容
     */
    public static readFile(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`读取文件失败 ${filePath}: ${errorMessage}`);
        }
    }

    /**
     * 写入文件内容
     * @param filePath 文件路径
     * @param content 文件内容
     */
    public static writeFile(filePath: string, content: string): void {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`写入文件失败 ${filePath}: ${errorMessage}`);
        }
    }

    /**
     * 获取文件的当前版本号
     * @param filePath 文件路径
     * @param config 文件配置
     * @returns 当前版本号，如果未找到则返回 null
     */
    public static getCurrentVersion(filePath: string, config: FileVersionConfig): string | null {
        if (!fs.existsSync(filePath)) {
            return null;
        }

        const content = this.readFile(filePath);
        return VersionUtils.extractVersion(content, config.versionRegex);
    }

    /**
     * 更新文件中的版本号
     * @param filePath 文件路径
     * @param config 文件配置
     * @param oldVersion 旧版本号
     * @param newVersion 新版本号
     * @returns 是否更新成功
     */
    public static updateVersion(
        filePath: string,
        config: FileVersionConfig,
        oldVersion: string,
        newVersion: string
    ): boolean {
        try {
            const content = this.readFile(filePath);
            const regex = new RegExp(config.versionRegex);

            // 检查是否匹配
            if (!regex.test(content)) {
                return false;
            }

            // 重新创建正则表达式（因为 test 会改变 lastIndex）
            const replaceRegex = new RegExp(config.versionRegex, 'g');

            // 替换版本号
            // 使用 replace 的回调函数来精确替换
            let newContent = content.replace(replaceRegex, (match, ...args) => {
                // 如果有捕获组，args[0] 是第一个捕获组（通常是版本号）
                // 如果没有捕获组，需要从 match 中提取版本号
                let versionInMatch: string;
                
                if (args.length > 0 && args[0]) {
                    // 有捕获组，使用捕获组的值
                    versionInMatch = args[0];
                } else {
                    // 无捕获组，尝试从匹配结果中提取版本号
                    const versionMatch = match.match(/\d+\.\d+\.\d+/);
                    if (versionMatch) {
                        versionInMatch = versionMatch[0];
                    } else {
                        // 无法提取版本号，返回原匹配
                        return match;
                    }
                }
                
                // 验证提取的版本号是否与旧版本号一致
                if (versionInMatch === oldVersion) {
                    // 替换匹配中的版本号
                    return match.replace(oldVersion, newVersion);
                }
                
                return match;
            });

            // 检查是否真的发生了替换
            if (newContent === content) {
                return false;
            }

            this.writeFile(filePath, newContent);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`更新版本号失败 ${filePath}: ${errorMessage}`);
        }
    }

    /**
     * 处理 package.json 文件（特殊处理，直接更新 version 字段）
     * @param filePath 文件路径
     * @param newVersion 新版本号
     * @returns 是否更新成功
     */
    public static updatePackageJsonVersion(filePath: string, newVersion: string): boolean {
        try {
            const content = this.readFile(filePath);
            const packageJson = JSON.parse(content);

            if (!packageJson.version) {
                throw new Error('package.json 中未找到 version 字段');
            }

            packageJson.version = newVersion;
            const newContent = JSON.stringify(packageJson, null, 2) + '\n';
            this.writeFile(filePath, newContent);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`更新 package.json 版本号失败: ${errorMessage}`);
        }
    }

    /**
     * 批量获取文件版本信息
     * @param projectRoot 项目根目录
     * @param configs 文件配置列表
     * @returns 文件版本信息列表
     */
    public static getFileVersionInfos(
        projectRoot: string,
        configs: FileVersionConfig[]
    ): FileVersionInfo[] {
        const infos: FileVersionInfo[] = [];

        for (const config of configs) {
            const filePath = path.join(projectRoot, config.path);
            const currentVersion = this.getCurrentVersion(filePath, config);

            if (currentVersion !== null) {
                infos.push({
                    filePath,
                    currentVersion,
                    newVersion: currentVersion, // 初始时新版本号等于当前版本号
                    config
                });
            }
        }

        return infos;
    }
}

