/**
 * VSCode 扩展主入口
 */
import * as vscode from 'vscode';
import { ConfigReader } from './utils/configReader';
import { FileVersionService } from './services/fileVersionService';
import { UserInteractionService } from './services/userInteractionService';
import { StatusBarService } from './services/statusBarService';
import { TemplateService } from './services/templateService';
import { GitService } from './services/gitService';
import { VersionUtils } from './utils/versionUtils';
import { FileVersionInfo, VersionUpdateType } from './types/version';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 激活扩展
 * @param context 扩展上下文
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('[版本号插件] 扩展 "发布自动更新版本号" 已激活');

    // 初始化状态栏
    try {
        StatusBarService.initialize(context);
        console.log('[版本号插件] 状态栏初始化成功');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[版本号插件] 状态栏初始化失败: ${errorMessage}`);
    }

    // 注册更新版本号命令（命令面板和快捷键）
    const updateVersionDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.updateVersion',
        async () => {
            console.log('[版本号插件] 更新版本号命令被触发（来自命令面板或快捷键）');
            try {
                await updateVersionCommand();
                // 更新版本号后，刷新状态栏
                StatusBarService.refresh();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );

    // 注册从文件右键更新版本号命令
    const updateVersionFromFileDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.updateVersionFromFile',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 更新版本号命令被触发（来自文件右键）');
            try {
                await updateVersionCommand();
                // 更新版本号后，刷新状态栏
                StatusBarService.refresh();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );

    // 注册创建 .gitignore 文件命令
    const createGitignoreDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.createGitignore',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 创建 .gitignore 文件命令被触发');
            try {
                const targetDir = uri.fsPath;
                // 确保是目录
                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                    UserInteractionService.showErrorMessage('请选择文件夹');
                    return;
                }
                await TemplateService.createGitignore(targetDir);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );

    // 动态注册创建 LICENSE 文件命令（为每个模板文件注册一个命令）
    const licenseTemplates = TemplateService.getLicenseTemplates();
    const licenseDisposables: vscode.Disposable[] = [];
    
    console.log(`[版本号插件] 找到 ${licenseTemplates.length} 个 LICENSE 模板: ${licenseTemplates.join(', ')}`);
    
    for (const templateFile of licenseTemplates) {
        // 为每个模板文件创建一个命令，命令ID格式：odinsamVsTools.createLicense.{文件名}
        // 文件名中的特殊字符需要处理，使用安全的命令ID格式
        const safeCommandId = templateFile.replace(/[^a-zA-Z0-9]/g, '_');
        const commandId = `odinsamVsTools.createLicense.${safeCommandId}`;
        
        console.log(`[版本号插件] 注册 LICENSE 命令: ${commandId} (模板文件: ${templateFile})`);
        
        const disposable = vscode.commands.registerCommand(
            commandId,
            async (uri: vscode.Uri) => {
                console.log(`[版本号插件] 创建 LICENSE 文件命令被触发 (模板: ${templateFile})`);
                try {
                    const targetDir = uri.fsPath;
                    // 确保是目录
                    const stat = fs.statSync(targetDir);
                    if (!stat.isDirectory()) {
                        UserInteractionService.showErrorMessage('请选择文件夹');
                        return;
                    }
                    await TemplateService.createLicense(targetDir, templateFile);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    UserInteractionService.showErrorMessage(errorMessage);
                }
            }
        );
        licenseDisposables.push(disposable);
    }
    
    // 保留旧的命令ID以保持向后兼容（如果没有模板文件，使用默认行为）
    const createLicenseDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.createLicense',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 创建 LICENSE 文件命令被触发（默认）');
            try {
                const targetDir = uri.fsPath;
                // 确保是目录
                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                    UserInteractionService.showErrorMessage('请选择文件夹');
                    return;
                }
                await TemplateService.createLicense(targetDir);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );
    licenseDisposables.push(createLicenseDisposable);

    // 注册创建 .versionconfig 文件命令
    const createVersionConfigDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.createVersionConfig',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 创建 .versionconfig 文件命令被触发');
            try {
                const targetDir = uri.fsPath;
                // 确保是目录
                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                    UserInteractionService.showErrorMessage('请选择文件夹');
                    return;
                }
                await TemplateService.createVersionConfig(targetDir);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );

    // 注册创建 CHANGELOG.md 文件命令
    const createChangelogDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.createChangelog',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 创建 CHANGELOG.md 文件命令被触发');
            try {
                const targetDir = uri.fsPath;
                // 确保是目录
                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                    UserInteractionService.showErrorMessage('请选择文件夹');
                    return;
                }
                await TemplateService.createChangelog(targetDir);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UserInteractionService.showErrorMessage(errorMessage);
            }
        }
    );

    // 注册更新日志命令
    const updateChangelogDisposable = vscode.commands.registerCommand(
        'odinsamVsTools.updateChangelog',
        async (uri: vscode.Uri) => {
            console.log('[版本号插件] 更新日志命令被触发');
            try {
                const filePath = uri.fsPath;
                
                // 查找文件所在的 Git 仓库根目录
                const gitRoot = GitService.findGitRoot(filePath);
                if (!gitRoot) {
                    UserInteractionService.showErrorMessage('未找到 Git 仓库，请确保当前项目已初始化 Git');
                    return;
                }

                console.log(`[版本号插件] 找到 Git 仓库根目录: ${gitRoot}`);

                // 生成 CHANGELOG.md 内容
                const changelogContent = await GitService.generateChangelog(gitRoot);
                
                // 在控制台输出生成的 CHANGELOG 内容
                console.log('========================================');
                console.log('生成的 CHANGELOG.md 内容:');
                console.log('========================================');
                console.log(changelogContent);
                console.log('========================================');

                // 确定 CHANGELOG.md 文件路径（在 Git 仓库根目录）
                const changelogPath = path.join(gitRoot, 'CHANGELOG.md');

                // 检查文件是否存在，如果存在则询问是否覆盖
                if (fs.existsSync(changelogPath)) {
                    const result = await vscode.window.showWarningMessage(
                        'CHANGELOG.md 文件已存在，是否覆盖？',
                        { modal: true },
                        '覆盖',
                        '取消'
                    );
                    if (result !== '覆盖') {
                        return;
                    }
                }

                // 写入文件
                fs.writeFileSync(changelogPath, changelogContent, 'utf8');

                // 显示成功消息
                vscode.window.showInformationMessage(`CHANGELOG.md 已生成: ${changelogPath}`);
                
                // 在控制台输出成功信息
                console.log(`[版本号插件] CHANGELOG.md 已成功生成到: ${changelogPath}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`[版本号插件] 更新日志失败: ${errorMessage}`);
                UserInteractionService.showErrorMessage(`更新日志失败: ${errorMessage}`);
            }
        }
    );

    // 注册所有命令
    context.subscriptions.push(
        updateVersionDisposable,
        updateVersionFromFileDisposable,
        createGitignoreDisposable,
        ...licenseDisposables, // 包含所有license相关的命令
        createVersionConfigDisposable,
        createChangelogDisposable,
        updateChangelogDisposable
    );
}

/**
 * 更新版本号命令处理函数
 */
async function updateVersionCommand(): Promise<void> {
    // 检查工作区
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        UserInteractionService.showWarningMessage('请先打开一个工作区');
        return;
    }

    // 从工作区根目录开始向下递归查找所有 .versionconfig 文件
    const projectConfigs = ConfigReader.findProjectRoots(workspaceFolders);

    if (projectConfigs.size === 0) {
        UserInteractionService.showWarningMessage(
            '未找到 .versionconfig 配置文件。请在项目根目录创建配置文件。'
        );
        return;
    }

    // 如果只有一个项目，直接使用
    // 如果有多个项目，让用户选择
    let selectedProjectRoot: string | undefined;
    let selectedConfig: import('./types/config').AutoUpdateConfig | undefined = projectConfigs.values().next().value;

    if (projectConfigs.size > 1) {
        // 多个项目，让用户选择
        const projectItems: vscode.QuickPickItem[] = Array.from(projectConfigs.entries()).map(
            ([root, config]) => ({
                label: path.basename(root),
                description: root,
                detail: `包含 ${config.files.length} 个文件配置`
            })
        );

        const selected = await vscode.window.showQuickPick(projectItems, {
            placeHolder: '请选择要更新版本号的项目'
        });

        if (!selected || !selected.description) {
            return;
        }

        selectedProjectRoot = selected.description;
        selectedConfig = projectConfigs.get(selectedProjectRoot);
    } else {
        selectedProjectRoot = projectConfigs.keys().next().value;
    }

    // 验证配置
    if (!selectedProjectRoot || !selectedConfig) {
        UserInteractionService.showWarningMessage('无法确定项目配置');
        return;
    }

    // 获取所有文件的版本信息
    const allFileInfos = FileVersionService.getFileVersionInfos(
        selectedProjectRoot,
        selectedConfig.files
    );

    if (allFileInfos.length === 0) {
        UserInteractionService.showWarningMessage('未找到任何可更新的文件或版本号');
        return;
    }

    // 让用户选择要更新的文件
    const selectedFileInfos = await UserInteractionService.selectFilesToUpdate(allFileInfos);

    if (selectedFileInfos.length === 0) {
        return;
    }

    // 检查所有选中文件的版本号是否一致
    const versions = new Set(selectedFileInfos.map(info => info.currentVersion));
    if (versions.size > 1) {
        const result = await vscode.window.showWarningMessage(
            `检测到多个不同的版本号: ${Array.from(versions).join(', ')}。是否继续？`,
            { modal: true },
            '继续',
            '取消'
        );
        if (result !== '继续') {
            return;
        }
    }

    // 使用第一个文件的版本号作为基准
    const baseVersion = selectedFileInfos[0].currentVersion;

    // 让用户选择更新方式
    const updateTypeResult = await UserInteractionService.selectUpdateType(baseVersion);

    // 计算新版本号
    let newVersion: string;
    if (updateTypeResult.type === VersionUpdateType.Custom) {
        newVersion = updateTypeResult.customVersion!;
    } else {
        newVersion = VersionUtils.incrementVersion(baseVersion, updateTypeResult.type);
    }

    // 更新所有选中文件的新版本号
    selectedFileInfos.forEach(info => {
        info.newVersion = newVersion;
    });

    // 确认更新
    const confirmed = await UserInteractionService.confirmUpdate(selectedFileInfos);
    if (!confirmed) {
        return;
    }

    // 执行更新
    const updatedFiles: FileVersionInfo[] = [];
    const errors: string[] = [];

    for (const fileInfo of selectedFileInfos) {
        try {
            const isPackageJson = fileInfo.config.path.toLowerCase().endsWith('package.json');
            let success: boolean;

            if (isPackageJson) {
                // package.json 特殊处理
                success = FileVersionService.updatePackageJsonVersion(
                    fileInfo.filePath,
                    fileInfo.newVersion
                );
            } else {
                // 其他文件使用正则表达式更新
                success = FileVersionService.updateVersion(
                    fileInfo.filePath,
                    fileInfo.config,
                    fileInfo.currentVersion,
                    fileInfo.newVersion
                );
            }

            if (success) {
                updatedFiles.push(fileInfo);
            } else {
                errors.push(`${fileInfo.config.path}: 更新失败（未找到匹配的版本号）`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`${fileInfo.config.path}: ${errorMessage}`);
        }
    }

    // 显示结果
    if (updatedFiles.length > 0) {
        await UserInteractionService.showSuccessMessage(updatedFiles);
    }

    if (errors.length > 0) {
        UserInteractionService.showErrorMessage(errors.join('\n'));
    }
}

/**
 * 停用扩展
 */
export function deactivate() {
    console.log('扩展 "发布自动更新版本号" 已停用');
}

