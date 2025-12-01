"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
/**
 * VSCode 扩展主入口
 */
const vscode = __importStar(require("vscode"));
const configReader_1 = require("./utils/configReader");
const fileVersionService_1 = require("./services/fileVersionService");
const userInteractionService_1 = require("./services/userInteractionService");
const statusBarService_1 = require("./services/statusBarService");
const templateService_1 = require("./services/templateService");
const gitService_1 = require("./services/gitService");
const versionUtils_1 = require("./utils/versionUtils");
const version_1 = require("./types/version");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * 激活扩展
 * @param context 扩展上下文
 */
function activate(context) {
    console.log('[版本号插件] 扩展 "发布自动更新版本号" 已激活');
    // 初始化状态栏
    try {
        statusBarService_1.StatusBarService.initialize(context);
        console.log('[版本号插件] 状态栏初始化成功');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[版本号插件] 状态栏初始化失败: ${errorMessage}`);
    }
    // 注册更新版本号命令（命令面板和快捷键）
    const updateVersionDisposable = vscode.commands.registerCommand('odinsamVsTools.updateVersion', async () => {
        console.log('[版本号插件] 更新版本号命令被触发（来自命令面板或快捷键）');
        try {
            await updateVersionCommand();
            // 更新版本号后，刷新状态栏
            statusBarService_1.StatusBarService.refresh();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    // 注册从文件右键更新版本号命令
    const updateVersionFromFileDisposable = vscode.commands.registerCommand('odinsamVsTools.updateVersionFromFile', async (uri) => {
        console.log('[版本号插件] 更新版本号命令被触发（来自文件右键）');
        try {
            await updateVersionCommand();
            // 更新版本号后，刷新状态栏
            statusBarService_1.StatusBarService.refresh();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    // 注册创建 .gitignore 文件命令
    const createGitignoreDisposable = vscode.commands.registerCommand('odinsamVsTools.createGitignore', async (uri) => {
        console.log('[版本号插件] 创建 .gitignore 文件命令被触发');
        try {
            const targetDir = uri.fsPath;
            // 确保是目录
            const stat = fs.statSync(targetDir);
            if (!stat.isDirectory()) {
                userInteractionService_1.UserInteractionService.showErrorMessage('请选择文件夹');
                return;
            }
            await templateService_1.TemplateService.createGitignore(targetDir);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    // 动态注册创建 LICENSE 文件命令（为每个模板文件注册一个命令）
    const licenseTemplates = templateService_1.TemplateService.getLicenseTemplates();
    const licenseDisposables = [];
    console.log(`[版本号插件] 找到 ${licenseTemplates.length} 个 LICENSE 模板: ${licenseTemplates.join(', ')}`);
    for (const templateFile of licenseTemplates) {
        // 为每个模板文件创建一个命令，命令ID格式：odinsamVsTools.createLicense.{文件名}
        // 文件名中的特殊字符需要处理，使用安全的命令ID格式
        const safeCommandId = templateFile.replace(/[^a-zA-Z0-9]/g, '_');
        const commandId = `odinsamVsTools.createLicense.${safeCommandId}`;
        console.log(`[版本号插件] 注册 LICENSE 命令: ${commandId} (模板文件: ${templateFile})`);
        const disposable = vscode.commands.registerCommand(commandId, async (uri) => {
            console.log(`[版本号插件] 创建 LICENSE 文件命令被触发 (模板: ${templateFile})`);
            try {
                const targetDir = uri.fsPath;
                // 确保是目录
                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                    userInteractionService_1.UserInteractionService.showErrorMessage('请选择文件夹');
                    return;
                }
                await templateService_1.TemplateService.createLicense(targetDir, templateFile);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
            }
        });
        licenseDisposables.push(disposable);
    }
    // 保留旧的命令ID以保持向后兼容（如果没有模板文件，使用默认行为）
    const createLicenseDisposable = vscode.commands.registerCommand('odinsamVsTools.createLicense', async (uri) => {
        console.log('[版本号插件] 创建 LICENSE 文件命令被触发（默认）');
        try {
            const targetDir = uri.fsPath;
            // 确保是目录
            const stat = fs.statSync(targetDir);
            if (!stat.isDirectory()) {
                userInteractionService_1.UserInteractionService.showErrorMessage('请选择文件夹');
                return;
            }
            await templateService_1.TemplateService.createLicense(targetDir);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    licenseDisposables.push(createLicenseDisposable);
    // 注册创建 .versionconfig 文件命令
    const createVersionConfigDisposable = vscode.commands.registerCommand('odinsamVsTools.createVersionConfig', async (uri) => {
        console.log('[版本号插件] 创建 .versionconfig 文件命令被触发');
        try {
            const targetDir = uri.fsPath;
            // 确保是目录
            const stat = fs.statSync(targetDir);
            if (!stat.isDirectory()) {
                userInteractionService_1.UserInteractionService.showErrorMessage('请选择文件夹');
                return;
            }
            await templateService_1.TemplateService.createVersionConfig(targetDir);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    // 注册创建 CHANGELOG.md 文件命令
    const createChangelogDisposable = vscode.commands.registerCommand('odinsamVsTools.createChangelog', async (uri) => {
        console.log('[版本号插件] 创建 CHANGELOG.md 文件命令被触发');
        try {
            const targetDir = uri.fsPath;
            // 确保是目录
            const stat = fs.statSync(targetDir);
            if (!stat.isDirectory()) {
                userInteractionService_1.UserInteractionService.showErrorMessage('请选择文件夹');
                return;
            }
            await templateService_1.TemplateService.createChangelog(targetDir);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            userInteractionService_1.UserInteractionService.showErrorMessage(errorMessage);
        }
    });
    // 注册更新日志命令
    const updateChangelogDisposable = vscode.commands.registerCommand('odinsamVsTools.updateChangelog', async (uri) => {
        console.log('[版本号插件] 更新日志命令被触发');
        try {
            const filePath = uri.fsPath;
            // 查找文件所在的 Git 仓库根目录
            const gitRoot = gitService_1.GitService.findGitRoot(filePath);
            if (!gitRoot) {
                userInteractionService_1.UserInteractionService.showErrorMessage('未找到 Git 仓库，请确保当前项目已初始化 Git');
                return;
            }
            console.log(`[版本号插件] 找到 Git 仓库根目录: ${gitRoot}`);
            // 生成 CHANGELOG.md 内容
            const changelogContent = await gitService_1.GitService.generateChangelog(gitRoot);
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
                const result = await vscode.window.showWarningMessage('CHANGELOG.md 文件已存在，是否覆盖？', { modal: true }, '覆盖', '取消');
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[版本号插件] 更新日志失败: ${errorMessage}`);
            userInteractionService_1.UserInteractionService.showErrorMessage(`更新日志失败: ${errorMessage}`);
        }
    });
    // 注册所有命令
    context.subscriptions.push(updateVersionDisposable, updateVersionFromFileDisposable, createGitignoreDisposable, ...licenseDisposables, // 包含所有license相关的命令
    createVersionConfigDisposable, createChangelogDisposable, updateChangelogDisposable);
}
/**
 * 更新版本号命令处理函数
 */
async function updateVersionCommand() {
    // 检查工作区
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        userInteractionService_1.UserInteractionService.showWarningMessage('请先打开一个工作区');
        return;
    }
    // 从工作区根目录开始向下递归查找所有 .versionconfig 文件
    const projectConfigs = configReader_1.ConfigReader.findProjectRoots(workspaceFolders);
    if (projectConfigs.size === 0) {
        userInteractionService_1.UserInteractionService.showWarningMessage('未找到 .versionconfig 配置文件。请在项目根目录创建配置文件。');
        return;
    }
    // 如果只有一个项目，直接使用
    // 如果有多个项目，让用户选择
    let selectedProjectRoot;
    let selectedConfig = projectConfigs.values().next().value;
    if (projectConfigs.size > 1) {
        // 多个项目，让用户选择
        const projectItems = Array.from(projectConfigs.entries()).map(([root, config]) => ({
            label: path.basename(root),
            description: root,
            detail: `包含 ${config.files.length} 个文件配置`
        }));
        const selected = await vscode.window.showQuickPick(projectItems, {
            placeHolder: '请选择要更新版本号的项目'
        });
        if (!selected || !selected.description) {
            return;
        }
        selectedProjectRoot = selected.description;
        selectedConfig = projectConfigs.get(selectedProjectRoot);
    }
    else {
        selectedProjectRoot = projectConfigs.keys().next().value;
    }
    // 验证配置
    if (!selectedProjectRoot || !selectedConfig) {
        userInteractionService_1.UserInteractionService.showWarningMessage('无法确定项目配置');
        return;
    }
    // 获取所有文件的版本信息
    const allFileInfos = fileVersionService_1.FileVersionService.getFileVersionInfos(selectedProjectRoot, selectedConfig.files);
    if (allFileInfos.length === 0) {
        userInteractionService_1.UserInteractionService.showWarningMessage('未找到任何可更新的文件或版本号');
        return;
    }
    // 让用户选择要更新的文件
    const selectedFileInfos = await userInteractionService_1.UserInteractionService.selectFilesToUpdate(allFileInfos);
    if (selectedFileInfos.length === 0) {
        return;
    }
    // 检查所有选中文件的版本号是否一致
    const versions = new Set(selectedFileInfos.map(info => info.currentVersion));
    if (versions.size > 1) {
        const result = await vscode.window.showWarningMessage(`检测到多个不同的版本号: ${Array.from(versions).join(', ')}。是否继续？`, { modal: true }, '继续', '取消');
        if (result !== '继续') {
            return;
        }
    }
    // 使用第一个文件的版本号作为基准
    const baseVersion = selectedFileInfos[0].currentVersion;
    // 让用户选择更新方式
    const updateTypeResult = await userInteractionService_1.UserInteractionService.selectUpdateType(baseVersion);
    // 计算新版本号
    let newVersion;
    if (updateTypeResult.type === version_1.VersionUpdateType.Custom) {
        newVersion = updateTypeResult.customVersion;
    }
    else {
        newVersion = versionUtils_1.VersionUtils.incrementVersion(baseVersion, updateTypeResult.type);
    }
    // 更新所有选中文件的新版本号
    selectedFileInfos.forEach(info => {
        info.newVersion = newVersion;
    });
    // 确认更新
    const confirmed = await userInteractionService_1.UserInteractionService.confirmUpdate(selectedFileInfos);
    if (!confirmed) {
        return;
    }
    // 执行更新
    const updatedFiles = [];
    const errors = [];
    for (const fileInfo of selectedFileInfos) {
        try {
            const isPackageJson = fileInfo.config.path.toLowerCase().endsWith('package.json');
            let success;
            if (isPackageJson) {
                // package.json 特殊处理
                success = fileVersionService_1.FileVersionService.updatePackageJsonVersion(fileInfo.filePath, fileInfo.newVersion);
            }
            else {
                // 其他文件使用正则表达式更新
                success = fileVersionService_1.FileVersionService.updateVersion(fileInfo.filePath, fileInfo.config, fileInfo.currentVersion, fileInfo.newVersion);
            }
            if (success) {
                updatedFiles.push(fileInfo);
            }
            else {
                errors.push(`${fileInfo.config.path}: 更新失败（未找到匹配的版本号）`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`${fileInfo.config.path}: ${errorMessage}`);
        }
    }
    // 显示结果
    if (updatedFiles.length > 0) {
        await userInteractionService_1.UserInteractionService.showSuccessMessage(updatedFiles);
    }
    if (errors.length > 0) {
        userInteractionService_1.UserInteractionService.showErrorMessage(errors.join('\n'));
    }
}
/**
 * 停用扩展
 */
function deactivate() {
    console.log('扩展 "发布自动更新版本号" 已停用');
}
//# sourceMappingURL=extension.js.map