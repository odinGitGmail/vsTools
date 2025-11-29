/**
 * 状态栏服务
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigReader } from '../utils/configReader';
import { FileVersionService } from './fileVersionService';

/**
 * 状态栏服务类
 */
export class StatusBarService {
    private static statusBarItem: vscode.StatusBarItem | undefined;
    private static currentProjectRoot: string | null = null;

    /**
     * 初始化状态栏
     */
    public static initialize(context: vscode.ExtensionContext): void {
        console.log('[版本号插件] 开始初始化状态栏服务');
        
        // 创建状态栏项
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        // 不绑定命令，仅用于显示
        // this.statusBarItem.command = 'odinsamVsTools.updateVersion';
        this.statusBarItem.tooltip = '当前项目版本号';
        
        // 默认显示 "Version"
        this.statusBarItem.text = 'Version';
        this.statusBarItem.show();

        context.subscriptions.push(this.statusBarItem);

        // 监听编辑器激活事件
        const disposable = vscode.window.onDidChangeActiveTextEditor(
            (editor) => {
                console.log('[版本号插件] 编辑器激活事件触发');
                this.updateStatusBar(editor);
            }
        );

        context.subscriptions.push(disposable);

        // 初始化时更新一次
        console.log('[版本号插件] 初始化时更新状态栏');
        this.updateStatusBar(vscode.window.activeTextEditor);
        
        console.log('[版本号插件] 状态栏服务初始化完成');
    }

    /**
     * 更新状态栏
     * @param editor 当前激活的编辑器
     */
    private static async updateStatusBar(
        editor: vscode.TextEditor | undefined
    ): Promise<void> {
        if (!this.statusBarItem) {
            return;
        }

        // 如果没有激活的文件，显示默认文本
        if (!editor || !editor.document) {
            this.statusBarItem.text = 'Version';
            this.statusBarItem.show();
            this.currentProjectRoot = null;
            return;
        }

        // 跳过未保存的文件（untitled 文件），显示默认文本
        if (editor.document.uri.scheme === 'untitled') {
            this.statusBarItem.text = 'Version';
            this.statusBarItem.show();
            this.currentProjectRoot = null;
            return;
        }

        const filePath = editor.document.uri.fsPath;

        try {
            // 查找文件所在的项目根目录（用于状态栏显示）
            const projectRoot = ConfigReader.findProjectRootForStatusBar(filePath);

            if (!projectRoot) {
                // 找不到项目根目录，显示默认文本
                // 调试信息：可以在开发者工具中查看
                console.log(`[版本号插件] 未找到项目根目录，文件路径: ${filePath}`);
                this.statusBarItem.text = 'Version';
                this.statusBarItem.show();
                this.currentProjectRoot = null;
                return;
            }

            console.log(`[版本号插件] 找到项目根目录: ${projectRoot}`);

            // 如果项目根目录没有变化，仍然需要检查版本号（可能文件被外部修改）
            this.currentProjectRoot = projectRoot;

            // 尝试读取配置文件（可选）
            let config = null;
            try {
                config = ConfigReader.readConfig(projectRoot);
                if (config) {
                    console.log(`[版本号插件] 找到配置文件`);
                } else {
                    console.log(`[版本号插件] 未找到配置文件，将直接从 package.json 读取版本号`);
                }
            } catch (error) {
                // 配置文件读取失败，但不影响从 package.json 读取版本号
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(`[版本号插件] 读取配置文件失败（将尝试从 package.json 读取）: ${errorMessage}`);
            }

            // 尝试从配置的文件中获取版本号
            let version: string | null = null;

            // 如果有配置文件，优先从配置文件中的文件读取
            if (config && config.files && config.files.length > 0) {
                console.log(`[版本号插件] 尝试从配置文件中的文件读取版本号`);
                for (const fileConfig of config.files) {
                    try {
                        const configFilePath = path.join(projectRoot, fileConfig.path);
                        const currentVersion = FileVersionService.getCurrentVersion(
                            configFilePath,
                            fileConfig
                        );
                        if (currentVersion) {
                            version = currentVersion;
                            console.log(`[版本号插件] 从 ${fileConfig.path} 读取到版本号: ${currentVersion}`);
                            break; // 找到第一个版本号就使用
                        }
                    } catch (error) {
                        // 忽略单个文件的错误，继续尝试下一个
                        continue;
                    }
                }
            }

            // 如果没有配置文件或配置文件中没有找到版本号，尝试从 package.json 获取
            if (!version) {
                const packageJsonPath = path.join(projectRoot, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    try {
                        let packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
                        // 移除 BOM 字符（如果存在）
                        if (packageJsonContent.charCodeAt(0) === 0xFEFF) {
                            packageJsonContent = packageJsonContent.slice(1);
                        }
                        const packageJson = JSON.parse(packageJsonContent);
                        if (packageJson.version && typeof packageJson.version === 'string') {
                            version = packageJson.version;
                            console.log(`[版本号插件] 从 package.json 读取到版本号: ${version}`);
                        }
                    } catch (error) {
                        // 忽略错误，继续尝试其他文件
                    }
                }
            }

            // 如果找到了版本号，显示在状态栏
            if (version) {
                this.statusBarItem.text = `Version: ${version}`;
                this.statusBarItem.show();
                console.log(`[版本号插件] 状态栏显示版本号: Version: ${version}`);
            } else {
                // 未找到版本号，显示默认文本
                this.statusBarItem.text = 'Version';
                this.statusBarItem.show();
                console.log(`[版本号插件] 未找到版本号，显示默认文本`);
            }
        } catch (error) {
            // 发生任何错误时显示默认文本
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`[版本号插件] 更新状态栏时发生错误: ${errorMessage}`);
            this.statusBarItem.text = 'Version';
            this.statusBarItem.show();
            this.currentProjectRoot = null;
        }
    }

    /**
     * 刷新状态栏（当版本号更新后调用）
     */
    public static refresh(): void {
        this.currentProjectRoot = null; // 重置，强制重新读取
        this.updateStatusBar(vscode.window.activeTextEditor);
    }
}

