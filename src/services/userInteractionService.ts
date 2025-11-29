/**
 * 用户交互服务
 */
import * as vscode from 'vscode';
import { FileVersionConfig } from '../types/config';
import { FileVersionInfo, VersionUpdateType } from '../types/version';

/**
 * 用户交互服务类
 */
export class UserInteractionService {
    /**
     * 选择要更新的文件
     * @param fileInfos 文件版本信息列表
     * @returns 选中的文件信息列表
     */
    public static async selectFilesToUpdate(
        fileInfos: FileVersionInfo[]
    ): Promise<FileVersionInfo[]> {
        if (fileInfos.length === 0) {
            return [];
        }

        // 如果只有一个文件，直接返回
        if (fileInfos.length === 1) {
            return fileInfos;
        }

        // 构建快速选择项
        const items: vscode.QuickPickItem[] = fileInfos.map((info, index) => {
            const relativePath = info.config.path;
            const description = info.config.description || '';
            return {
                label: `$(file) ${relativePath}`,
                description: `当前版本: ${info.currentVersion} ${description}`,
                detail: info.filePath,
                picked: true // 默认全选
            };
        });

        const selected = await vscode.window.showQuickPick(items, {
            canPickMany: true,
            placeHolder: '请选择要更新版本号的文件（可多选）'
        });

        if (!selected || selected.length === 0) {
            return [];
        }

        // 根据选中的项返回对应的文件信息
        const selectedPaths = new Set(selected.map(item => item.detail));
        return fileInfos.filter(info => selectedPaths.has(info.filePath));
    }

    /**
     * 选择版本更新方式
     * @param currentVersion 当前版本号
     * @returns 更新类型和自定义版本号（如果是自定义类型）
     */
    public static async selectUpdateType(
        currentVersion: string
    ): Promise<{ type: VersionUpdateType; customVersion?: string }> {
        const items: vscode.QuickPickItem[] = [
            {
                label: '$(arrow-up) Patch（补丁版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, VersionUpdateType.Patch)}`,
                detail: '修复 bug 或小的改动'
            },
            {
                label: '$(arrow-up) Minor（次版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, VersionUpdateType.Minor)}`,
                detail: '新增功能，向后兼容'
            },
            {
                label: '$(arrow-up) Major（主版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, VersionUpdateType.Major)}`,
                detail: '重大变更，可能不向后兼容'
            },
            {
                label: '$(edit) 自定义版本号',
                description: '手动输入版本号',
                detail: '输入任意版本号（格式: x.y.z）'
            }
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '请选择版本更新方式'
        });

        if (!selected) {
            throw new Error('用户取消了操作');
        }

        if (selected.label.includes('自定义')) {
            // 自定义版本号
            const customVersion = await this.inputCustomVersion(currentVersion);
            return {
                type: VersionUpdateType.Custom,
                customVersion
            };
        } else if (selected.label.includes('Patch')) {
            return { type: VersionUpdateType.Patch };
        } else if (selected.label.includes('Minor')) {
            return { type: VersionUpdateType.Minor };
        } else if (selected.label.includes('Major')) {
            return { type: VersionUpdateType.Major };
        } else {
            return { type: VersionUpdateType.Patch };
        }
    }

    /**
     * 输入自定义版本号
     * @param currentVersion 当前版本号
     * @returns 自定义版本号
     */
    private static async inputCustomVersion(currentVersion: string): Promise<string> {
        while (true) {
            const input = await vscode.window.showInputBox({
                prompt: `请输入新版本号（当前版本: ${currentVersion}）`,
                placeHolder: '例如: 1.2.3',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return '版本号不能为空';
                    }
                    const versionPattern = /^\d+\.\d+\.\d+$/;
                    if (!versionPattern.test(value.trim())) {
                        return '版本号格式不正确，请使用 x.y.z 格式（例如: 1.2.3）';
                    }
                    return null;
                }
            });

            if (!input) {
                throw new Error('用户取消了操作');
            }

            return input.trim();
        }
    }

    /**
     * 计算下一个版本号（用于显示预览）
     * @param currentVersion 当前版本号
     * @param type 更新类型
     * @returns 下一个版本号
     */
    private static calculateNextVersion(
        currentVersion: string,
        type: VersionUpdateType
    ): string {
        const parts = currentVersion.split('.').map(Number);
        if (parts.length !== 3) {
            return currentVersion;
        }

        switch (type) {
            case VersionUpdateType.Major:
                return `${parts[0] + 1}.0.0`;
            case VersionUpdateType.Minor:
                return `${parts[0]}.${parts[1] + 1}.0`;
            case VersionUpdateType.Patch:
            default:
                return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
        }
    }

    /**
     * 确认更新操作
     * @param fileInfos 文件版本信息列表
     * @returns 是否确认
     */
    public static async confirmUpdate(fileInfos: FileVersionInfo[]): Promise<boolean> {
        const fileList = fileInfos
            .map(info => `  • ${info.config.path}: ${info.currentVersion} -> ${info.newVersion}`)
            .join('\n');

        const message = `确认更新以下文件的版本号？\n\n${fileList}`;

        const result = await vscode.window.showWarningMessage(
            message,
            { modal: true },
            '确认',
            '取消'
        );

        return result === '确认';
    }

    /**
     * 显示成功消息
     * @param fileInfos 已更新的文件信息列表
     */
    public static async showSuccessMessage(fileInfos: FileVersionInfo[]): Promise<void> {
        const fileCount = fileInfos.length;
        const message = `成功更新 ${fileCount} 个文件的版本号`;
        
        if (fileInfos.length === 1) {
            // 只有一个文件，显示文件名作为链接
            const fileInfo = fileInfos[0];
            const fileName = fileInfo.config.path;
            const result = await vscode.window.showInformationMessage(
                message,
                `打开 ${fileName}`
            );
            
            if (result === `打开 ${fileName}`) {
                // 打开文件
                const document = await vscode.workspace.openTextDocument(fileInfo.filePath);
                await vscode.window.showTextDocument(document);
            }
        } else {
            // 多个文件，显示列表让用户选择
            const items: vscode.MessageItem[] = fileInfos.map(info => ({
                title: `打开 ${info.config.path}`
            }));
            
            const result = await vscode.window.showInformationMessage(
                message,
                { modal: false },
                ...items
            );
            
            if (result) {
                // 找到对应的文件并打开
                const selectedFile = fileInfos.find(info => `打开 ${info.config.path}` === result.title);
                if (selectedFile) {
                    const document = await vscode.workspace.openTextDocument(selectedFile.filePath);
                    await vscode.window.showTextDocument(document);
                }
            }
        }
    }

    /**
     * 显示错误消息
     * @param message 错误消息
     */
    public static showErrorMessage(message: string): void {
        vscode.window.showErrorMessage(`更新版本号失败: ${message}`);
    }

    /**
     * 显示警告消息
     * @param message 警告消息
     */
    public static showWarningMessage(message: string): void {
        vscode.window.showWarningMessage(message);
    }
}

