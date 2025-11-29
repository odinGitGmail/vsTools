/**
 * 配置文件读取工具
 */
import * as fs from 'fs';
import * as path from 'path';
import { AutoUpdateConfig, FileVersionConfig } from '../types/config';

/**
 * 配置文件读取器
 */
export class ConfigReader {
    /** 配置文件名 */
    private static readonly CONFIG_FILE_NAME = '.versionconfig';

    /**
     * 查找项目根目录（通过 .versionconfig 文件）
     * 从当前文件向上查找包含 .versionconfig 的目录
     * @param startPath 起始路径
     * @returns 项目根目录路径，如果未找到则返回 null
     */
    public static findProjectRoot(startPath: string): string | null {
        let currentPath = startPath;

        // 如果是文件，获取其所在目录
        if (fs.existsSync(currentPath) && fs.statSync(currentPath).isFile()) {
            currentPath = path.dirname(currentPath);
        }

        // 向上查找直到找到 .versionconfig 配置文件或到达根目录
        const checkedPaths: string[] = [];
        while (currentPath !== path.dirname(currentPath)) {
            checkedPaths.push(currentPath);
            const configPath = path.join(currentPath, this.CONFIG_FILE_NAME);
            
            if (fs.existsSync(configPath)) {
                console.log(`[版本号插件] 找到配置文件: ${configPath}`);
                return currentPath;
            }
            
            currentPath = path.dirname(currentPath);
        }

        console.log(`[版本号插件] 未找到配置文件，已检查的路径: ${checkedPaths.join(' -> ')}`);
        return null;
    }

    /**
     * 读取配置文件
     * @param projectRoot 项目根目录
     * @returns 配置对象，如果读取失败则返回 null
     */
    public static readConfig(projectRoot: string): AutoUpdateConfig | null {
        try {
            const configPath = path.join(projectRoot, this.CONFIG_FILE_NAME);
            
            if (!fs.existsSync(configPath)) {
                return null;
            }

            let configContent = fs.readFileSync(configPath, 'utf8');
            
            // 移除 BOM 字符（如果存在）
            if (configContent.charCodeAt(0) === 0xFEFF) {
                configContent = configContent.slice(1);
            }
            
            const config: AutoUpdateConfig = JSON.parse(configContent);

            // 验证配置格式
            if (!config.files || !Array.isArray(config.files)) {
                throw new Error('配置文件格式错误：缺少 files 数组');
            }

            // 验证每个文件配置
            for (const fileConfig of config.files) {
                if (!fileConfig.path || !fileConfig.versionRegex) {
                    throw new Error('配置文件格式错误：文件配置缺少 path 或 versionRegex');
                }
            }

            return config;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`读取配置文件失败: ${errorMessage}`);
        }
    }

    /**
     * 递归查找目录下的所有 .versionconfig 文件
     * @param dirPath 目录路径
     * @param maxDepth 最大搜索深度（防止无限递归）
     * @param currentDepth 当前深度
     * @param foundConfigs 已找到的配置文件路径集合
     */
    private static findConfigFilesRecursive(
        dirPath: string,
        maxDepth: number = 10,
        currentDepth: number = 0,
        foundConfigs: Set<string> = new Set()
    ): void {
        if (currentDepth >= maxDepth) {
            return;
        }

        try {
            // 检查当前目录是否有配置文件
            const configPath = path.join(dirPath, this.CONFIG_FILE_NAME);
            if (fs.existsSync(configPath)) {
                foundConfigs.add(dirPath);
                console.log(`[版本号插件] 找到配置文件: ${configPath}`);
                return; // 找到配置文件后不再向下查找（一个项目一个配置）
            }

            // 读取目录内容
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            // 递归查找子目录
            for (const entry of entries) {
                // 跳过隐藏目录和常见的不需要搜索的目录
                if (entry.isDirectory() && 
                    !entry.name.startsWith('.') && 
                    entry.name !== 'node_modules' &&
                    entry.name !== 'bin' &&
                    entry.name !== 'obj' &&
                    entry.name !== 'out' &&
                    entry.name !== 'dist') {
                    const subDirPath = path.join(dirPath, entry.name);
                    this.findConfigFilesRecursive(subDirPath, maxDepth, currentDepth + 1, foundConfigs);
                }
            }
        } catch (error) {
            // 忽略无法访问的目录
        }
    }

    /**
     * 查找包含 .versionconfig 的项目根目录（用于更新版本号功能）
     * 从工作区根目录开始向下递归查找
     * @param workspaceFolders 工作区文件夹列表
     * @returns 项目根目录及其配置的映射
     */
    public static findProjectRoots(workspaceFolders: readonly { uri: { fsPath: string } }[]): Map<string, AutoUpdateConfig> {
        const projectConfigs = new Map<string, AutoUpdateConfig>();

        for (const folder of workspaceFolders) {
            const workspaceRoot = folder.uri.fsPath;
            console.log(`[版本号插件] 从工作区根目录开始查找: ${workspaceRoot}`);
            
            // 递归查找所有配置文件
            const foundConfigs = new Set<string>();
            this.findConfigFilesRecursive(workspaceRoot, 10, 0, foundConfigs);

            // 读取找到的配置文件
            for (const configDir of foundConfigs) {
                try {
                    const config = this.readConfig(configDir);
                    if (config) {
                        projectConfigs.set(configDir, config);
                        console.log(`[版本号插件] 成功加载配置文件: ${configDir}`);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.log(`[版本号插件] 读取配置文件失败 ${configDir}: ${errorMessage}`);
                }
            }
        }

        console.log(`[版本号插件] 共找到 ${projectConfigs.size} 个配置文件`);
        return projectConfigs;
    }

    /**
     * 查找项目根目录（用于状态栏显示，查找 package.json 或 .csproj）
     * @param startPath 起始路径
     * @returns 项目根目录路径，如果未找到则返回 null
     */
    public static findProjectRootForStatusBar(startPath: string): string | null {
        let currentPath = startPath;

        // 如果是文件，获取其所在目录
        if (fs.existsSync(currentPath) && fs.statSync(currentPath).isFile()) {
            currentPath = path.dirname(currentPath);
        }

        // 向上查找直到找到 package.json 或 .csproj 文件
        while (currentPath !== path.dirname(currentPath)) {
            // 检查是否有 package.json 文件
            const packageJsonPath = path.join(currentPath, 'package.json');
            const hasPackageJson = fs.existsSync(packageJsonPath);
            
            // 检查是否有 .csproj 文件（在当前目录中）
            let hasCsproj = false;
            try {
                const files = fs.readdirSync(currentPath);
                hasCsproj = files.some(file => file.endsWith('.csproj'));
            } catch (error) {
                // 忽略读取目录失败的错误
            }
            
            // 如果找到 package.json 或 .csproj，返回项目根目录
            if (hasPackageJson || hasCsproj) {
                return currentPath;
            }
            
            currentPath = path.dirname(currentPath);
        }

        return null;
    }
}

