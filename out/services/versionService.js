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
exports.VersionService = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * 执行命令并返回 Promise
 * @param command 要执行的命令
 * @param options 执行选项
 * @returns Promise，resolve 时返回 stdout 字符串
 */
function execPromise(command, options) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, { ...options, encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(String(stdout || ''));
            }
        });
    });
}
/**
 * 版本号服务类
 */
class VersionService {
    /**
     * 获取最新的 tag 版本号
     * @param projectRoot 项目根目录
     * @returns 最新的 tag 版本号，如果没有则返回 null
     */
    static async getLatestTag(projectRoot) {
        try {
            const stdout = await execPromise('git describe --tags --abbrev=0', {
                cwd: projectRoot,
                maxBuffer: 1024 * 1024
            });
            return stdout.trim() || null;
        }
        catch (error) {
            // 如果没有 tag，命令会失败，返回 null
            return null;
        }
    }
    /**
     * 获取当前提交的版本号（tag 或提交哈希）
     * @param projectRoot 项目根目录
     * @returns 版本号
     */
    static async getCurrentVersion(projectRoot) {
        try {
            // 尝试获取当前提交的 tag
            const tagOutput = await execPromise('git describe --tags --exact-match HEAD 2>/dev/null || echo ""', {
                cwd: projectRoot,
                maxBuffer: 1024 * 1024,
                shell: true
            });
            if (tagOutput.trim()) {
                return tagOutput.trim();
            }
            // 如果没有 tag，获取提交哈希（前8位）
            const hashOutput = await execPromise('git rev-parse --short=8 HEAD', {
                cwd: projectRoot,
                maxBuffer: 1024 * 1024
            });
            return hashOutput.trim();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`获取当前版本号失败: ${errorMessage}`);
        }
    }
    /**
     * 获取项目文件中的版本号（如 package.json、.csproj 等）
     * @param projectRoot 项目根目录
     * @param filePath 文件路径（相对于项目根目录）
     * @param versionRegex 版本号正则表达式
     * @returns 版本号，如果未找到则返回 null
     */
    static async getProjectVersion(projectRoot, filePath, versionRegex) {
        try {
            const fullPath = path.join(projectRoot, filePath);
            if (!fs.existsSync(fullPath)) {
                return null;
            }
            const content = fs.readFileSync(fullPath, 'utf8');
            const match = content.match(new RegExp(versionRegex));
            if (match && match[1]) {
                return match[1];
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * 自动生成提交信息（包含版本号）
     * @param projectRoot 项目根目录
     * @param baseMessage 基础提交信息
     * @returns 包含版本号的提交信息
     */
    static async generateCommitMessage(projectRoot, baseMessage) {
        try {
            // 获取当前版本号
            const currentVersion = await this.getCurrentVersion(projectRoot);
            // 获取最新的 tag
            const latestTag = await this.getLatestTag(projectRoot);
            // 生成提交信息
            let commitMessage = baseMessage;
            if (latestTag) {
                commitMessage += `\n\n版本: ${currentVersion} (基于 ${latestTag})`;
            }
            else {
                commitMessage += `\n\n版本: ${currentVersion}`;
            }
            return commitMessage;
        }
        catch (error) {
            // 如果获取版本号失败，返回原始提交信息
            return baseMessage;
        }
    }
}
exports.VersionService = VersionService;
//# sourceMappingURL=versionService.js.map