/**
 * 模板文件服务
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GitService } from './gitService';

/**
 * 模板文件服务类
 */
export class TemplateService {
    /**
     * 获取模板文件目录
     */
    private static getTemplateDir(): string {
        // 尝试获取扩展路径（生产环境和开发环境都适用）
        const extensionId = 'odinsam-vstools';
        const extension = vscode.extensions.getExtension(extensionId);
        if (extension) {
            // 模板文件在扩展根目录的src/template
            const templatePath = path.join(extension.extensionPath, 'src', 'template');
            console.log(`[模板服务] 尝试从扩展路径获取模板: ${templatePath}`);
            if (fs.existsSync(templatePath)) {
                console.log(`[模板服务] ✅ 找到模板目录: ${templatePath}`);
                return templatePath;
            }
            
            // 如果 src/template 不存在，尝试从扩展根目录直接查找
            const rootTemplatePath = path.join(extension.extensionPath, 'template');
            console.log(`[模板服务] 尝试从扩展根目录获取模板: ${rootTemplatePath}`);
            if (fs.existsSync(rootTemplatePath)) {
                console.log(`[模板服务] ✅ 找到模板目录: ${rootTemplatePath}`);
                return rootTemplatePath;
            }
            
            // 列出扩展目录下的所有文件和目录，用于调试
            try {
                const extensionFiles = fs.readdirSync(extension.extensionPath);
                console.log(`[模板服务] 扩展目录内容: ${extensionFiles.join(', ')}`);
            } catch (error) {
                console.error(`[模板服务] 无法读取扩展目录: ${error}`);
            }
        }
        
        // 如果无法通过扩展路径获取，尝试从__dirname推断
        // 如果__dirname在out目录下，说明是编译后的代码，需要找到src目录
        let templatePath: string;
        if (__dirname.includes(path.sep + 'out' + path.sep) || __dirname.endsWith(path.sep + 'out')) {
            // 编译后的代码：从out/services/..找到项目根目录，然后到src/template
            const projectRoot = path.resolve(__dirname, '..', '..');
            templatePath = path.join(projectRoot, 'src', 'template');
            console.log(`[模板服务] 从编译后路径推断: ${templatePath}`);
        } else {
            // 开发环境：直接从__dirname向上找到src/template
            templatePath = path.join(__dirname, '..', 'template');
            console.log(`[模板服务] 从开发环境路径推断: ${templatePath}`);
        }
        
        if (fs.existsSync(templatePath)) {
            console.log(`[模板服务] ✅ 找到模板目录: ${templatePath}`);
            return templatePath;
        }
        
        // 如果都找不到，返回路径（让错误在读取文件时抛出，提供更详细的错误信息）
        console.error(`[模板服务] ❌ 未找到模板目录: ${templatePath}`);
        console.error(`[模板服务] 扩展路径: ${extension?.extensionPath || '未找到扩展'}`);
        return templatePath;
    }

    /**
     * 创建 .gitignore 文件
     * @param targetDir 目标目录
     */
    public static async createGitignore(targetDir: string): Promise<void> {
        const templatePath = path.join(this.getTemplateDir(), '.gitignore');
        const targetPath = path.join(targetDir, '.gitignore');

        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage(
                '.gitignore 文件已存在，是否覆盖？',
                { modal: true },
                '覆盖',
                '取消'
            );
            if (result !== '覆盖') {
                return;
            }
        }

        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 .gitignore 文件: ${targetPath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 .gitignore 文件失败: ${errorMessage}`);
        }
    }

    /**
     * 创建 LICENSE 文件
     * @param targetDir 目标目录
     */
    public static async createLicense(targetDir: string): Promise<void> {
        const templatePath = path.join(this.getTemplateDir(), 'LICENSE');
        const targetPath = path.join(targetDir, 'LICENSE');

        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage(
                'LICENSE 文件已存在，是否覆盖？',
                { modal: true },
                '覆盖',
                '取消'
            );
            if (result !== '覆盖') {
                return;
            }
        }

        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 LICENSE 文件: ${targetPath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 LICENSE 文件失败: ${errorMessage}`);
        }
    }

    /**
     * 创建 .versionconfig 文件
     * @param targetDir 目标目录
     */
    public static async createVersionConfig(targetDir: string): Promise<void> {
        const templatePath = path.join(this.getTemplateDir(), '.versionconfig');
        const targetPath = path.join(targetDir, '.versionconfig');

        if (fs.existsSync(targetPath)) {
            const result = await vscode.window.showWarningMessage(
                '.versionconfig 文件已存在，是否覆盖？',
                { modal: true },
                '覆盖',
                '取消'
            );
            if (result !== '覆盖') {
                return;
            }
        }

        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 .versionconfig 文件: ${targetPath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 .versionconfig 文件失败: ${errorMessage}`);
        }
    }

    /**
     * 创建 CHANGELOG.md 文件
     * @param targetDir 目标目录
     */
    public static async createChangelog(targetDir: string): Promise<void> {
        const templatePath = path.join(this.getTemplateDir(), 'CHANGELOG.md');
        const targetPath = path.join(targetDir, 'CHANGELOG.md');

        if (fs.existsSync(targetPath)) {
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

        try {
            let content: string;

            // 检查是否是 Git 仓库，如果是则尝试生成 CHANGELOG
            const gitRoot = GitService.findGitRoot(targetDir);
            if (gitRoot) {
                try {
                    // 尝试生成 CHANGELOG 内容
                    content = await GitService.generateChangelog(gitRoot);
                    console.log('[模板服务] 从 Git 日志生成 CHANGELOG.md 内容');
                } catch (error) {
                    // 如果生成失败，使用模板
                    console.warn('[模板服务] 无法从 Git 日志生成内容，使用模板:', error);
                    content = fs.readFileSync(templatePath, 'utf8');
                }
            } else {
                // 不是 Git 仓库，使用模板
                content = fs.readFileSync(templatePath, 'utf8');
            }

            fs.writeFileSync(targetPath, content, 'utf8');
            vscode.window.showInformationMessage(`已创建 CHANGELOG.md 文件: ${targetPath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`创建 CHANGELOG.md 文件失败: ${errorMessage}`);
        }
    }
}

