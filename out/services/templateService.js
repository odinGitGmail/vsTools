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
exports.TemplateService = void 0;
/**
 * 模板文件服务
 */
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const gitService_1 = require("./gitService");
/**
 * 模板文件服务类
 */
class TemplateService {
    /**
     * 获取模板文件目录
     */
    static getTemplateDir() {
        // 尝试获取扩展路径（生产环境和开发环境都适用）
        const extensionId = 'odinsam-vstools';
        const extension = vscode.extensions.getExtension(extensionId);
        if (extension) {
            // 模板文件在扩展根目录的src/template
            const templatePath = path.join(extension.extensionPath, 'src', 'template');
            if (fs.existsSync(templatePath)) {
                return templatePath;
            }
        }
        // 如果无法通过扩展路径获取，尝试从__dirname推断
        // 如果__dirname在out目录下，说明是编译后的代码，需要找到src目录
        let templatePath;
        if (__dirname.includes(path.sep + 'out' + path.sep) || __dirname.endsWith(path.sep + 'out')) {
            // 编译后的代码：从out/services/..找到项目根目录，然后到src/template
            const projectRoot = path.resolve(__dirname, '..', '..');
            templatePath = path.join(projectRoot, 'src', 'template');
        }
        else {
            // 开发环境：直接从__dirname向上找到src/template
            templatePath = path.join(__dirname, '..', 'template');
        }
        if (fs.existsSync(templatePath)) {
            return templatePath;
        }
        // 如果都找不到，返回路径（让错误在读取文件时抛出，提供更详细的错误信息）
        return templatePath;
    }
    /**
     * 创建 .gitignore 文件
     * @param targetDir 目标目录
     */
    static async createGitignore(targetDir) {
        const templatePath = path.join(this.getTemplateDir(), '.gitignore');
        const targetPath = path.join(targetDir, '.gitignore');
        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage('.gitignore 文件已存在，是否覆盖？', { modal: true }, '覆盖', '取消');
            if (result !== '覆盖') {
                return;
            }
        }
        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 .gitignore 文件: ${targetPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 .gitignore 文件失败: ${errorMessage}`);
        }
    }
    /**
     * 创建 LICENSE 文件
     * @param targetDir 目标目录
     */
    static async createLicense(targetDir) {
        const templatePath = path.join(this.getTemplateDir(), 'LICENSE');
        const targetPath = path.join(targetDir, 'LICENSE');
        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage('LICENSE 文件已存在，是否覆盖？', { modal: true }, '覆盖', '取消');
            if (result !== '覆盖') {
                return;
            }
        }
        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 LICENSE 文件: ${targetPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 LICENSE 文件失败: ${errorMessage}`);
        }
    }
    /**
     * 创建 .versionconfig 文件
     * @param targetDir 目标目录
     */
    static async createVersionConfig(targetDir) {
        const templatePath = path.join(this.getTemplateDir(), '.versionconfig');
        const targetPath = path.join(targetDir, '.versionconfig');
        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage('.versionconfig 文件已存在，是否覆盖？', { modal: true }, '覆盖', '取消');
            if (result !== '覆盖') {
                return;
            }
        }
        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 .versionconfig 文件: ${targetPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 .versionconfig 文件失败: ${errorMessage}`);
        }
    }
    /**
     * 创建 CHANGELOG.md 文件
     * @param targetDir 目标目录
     */
    static async createChangelog(targetDir) {
        const templatePath = path.join(this.getTemplateDir(), 'CHANGELOG.md');
        const targetPath = path.join(targetDir, 'CHANGELOG.md');
        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage('CHANGELOG.md 文件已存在，是否覆盖？', { modal: true }, '覆盖', '取消');
            if (result !== '覆盖') {
                return;
            }
        }
        try {
            let content;
            // 检查是否是 Git 仓库，如果是则尝试生成 CHANGELOG
            const gitRoot = gitService_1.GitService.findGitRoot(targetDir);
            if (gitRoot) {
                try {
                    // 尝试生成 CHANGELOG 内容
                    content = await gitService_1.GitService.generateChangelog(gitRoot);
                    console.log('[模板服务] 从 Git 日志生成 CHANGELOG.md 内容');
                }
                catch (error) {
                    // 如果生成失败，使用模板
                    console.warn('[模板服务] 无法从 Git 日志生成内容，使用模板:', error);
                    content = fs.readFileSync(templatePath, 'utf8');
                }
            }
            else {
                // 不是 Git 仓库，使用模板
                content = fs.readFileSync(templatePath, 'utf8');
            }
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 CHANGELOG.md 文件: ${targetPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 CHANGELOG.md 文件失败: ${errorMessage}`);
        }
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=templateService.js.map