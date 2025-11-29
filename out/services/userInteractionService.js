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
exports.UserInteractionService = void 0;
/**
 * 用户交互服务
 */
const vscode = __importStar(require("vscode"));
const version_1 = require("../types/version");
/**
 * 用户交互服务类
 */
class UserInteractionService {
    /**
     * 选择要更新的文件
     * @param fileInfos 文件版本信息列表
     * @returns 选中的文件信息列表
     */
    static async selectFilesToUpdate(fileInfos) {
        if (fileInfos.length === 0) {
            return [];
        }
        // 如果只有一个文件，直接返回
        if (fileInfos.length === 1) {
            return fileInfos;
        }
        // 构建快速选择项
        const items = fileInfos.map((info, index) => {
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
    static async selectUpdateType(currentVersion) {
        const items = [
            {
                label: '$(arrow-up) Patch（补丁版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, version_1.VersionUpdateType.Patch)}`,
                detail: '修复 bug 或小的改动'
            },
            {
                label: '$(arrow-up) Minor（次版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, version_1.VersionUpdateType.Minor)}`,
                detail: '新增功能，向后兼容'
            },
            {
                label: '$(arrow-up) Major（主版本）',
                description: `例如: ${currentVersion} -> ${this.calculateNextVersion(currentVersion, version_1.VersionUpdateType.Major)}`,
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
                type: version_1.VersionUpdateType.Custom,
                customVersion
            };
        }
        else if (selected.label.includes('Patch')) {
            return { type: version_1.VersionUpdateType.Patch };
        }
        else if (selected.label.includes('Minor')) {
            return { type: version_1.VersionUpdateType.Minor };
        }
        else if (selected.label.includes('Major')) {
            return { type: version_1.VersionUpdateType.Major };
        }
        else {
            return { type: version_1.VersionUpdateType.Patch };
        }
    }
    /**
     * 输入自定义版本号
     * @param currentVersion 当前版本号
     * @returns 自定义版本号
     */
    static async inputCustomVersion(currentVersion) {
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
    static calculateNextVersion(currentVersion, type) {
        const parts = currentVersion.split('.').map(Number);
        if (parts.length !== 3) {
            return currentVersion;
        }
        switch (type) {
            case version_1.VersionUpdateType.Major:
                return `${parts[0] + 1}.0.0`;
            case version_1.VersionUpdateType.Minor:
                return `${parts[0]}.${parts[1] + 1}.0`;
            case version_1.VersionUpdateType.Patch:
            default:
                return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
        }
    }
    /**
     * 确认更新操作
     * @param fileInfos 文件版本信息列表
     * @returns 是否确认
     */
    static async confirmUpdate(fileInfos) {
        const fileList = fileInfos
            .map(info => `  • ${info.config.path}: ${info.currentVersion} -> ${info.newVersion}`)
            .join('\n');
        const message = `确认更新以下文件的版本号？\n\n${fileList}`;
        const result = await vscode.window.showWarningMessage(message, { modal: true }, '确认', '取消');
        return result === '确认';
    }
    /**
     * 显示成功消息
     * @param fileInfos 已更新的文件信息列表
     */
    static async showSuccessMessage(fileInfos) {
        const fileCount = fileInfos.length;
        const message = `成功更新 ${fileCount} 个文件的版本号`;
        if (fileInfos.length === 1) {
            // 只有一个文件，显示文件名作为链接
            const fileInfo = fileInfos[0];
            const fileName = fileInfo.config.path;
            const result = await vscode.window.showInformationMessage(message, `打开 ${fileName}`);
            if (result === `打开 ${fileName}`) {
                // 打开文件
                const document = await vscode.workspace.openTextDocument(fileInfo.filePath);
                await vscode.window.showTextDocument(document);
            }
        }
        else {
            // 多个文件，显示列表让用户选择
            const items = fileInfos.map(info => ({
                title: `打开 ${info.config.path}`
            }));
            const result = await vscode.window.showInformationMessage(message, { modal: false }, ...items);
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
    static showErrorMessage(message) {
        vscode.window.showErrorMessage(`更新版本号失败: ${message}`);
    }
    /**
     * 显示警告消息
     * @param message 警告消息
     */
    static showWarningMessage(message) {
        vscode.window.showWarningMessage(message);
    }
}
exports.UserInteractionService = UserInteractionService;
//# sourceMappingURL=userInteractionService.js.map