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
exports.GitService = void 0;
const child_process_1 = require("child_process");
const util = __importStar(require("util"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execPromise = util.promisify(child_process_1.exec);
/**
 * Git 服务类
 */
class GitService {
    /**
     * 获取 Git 提交信息
     * @param projectRoot 项目根目录
     * @returns Git 提交信息列表
     */
    static async getCommitInfo(projectRoot) {
        // 检查是否是 Git 仓库
        const gitDir = path.join(projectRoot, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('当前目录不是 Git 仓库');
        }
        try {
            // 执行 git log 命令获取所有提交信息
            // 格式：--pretty=format:"%H|%an|%ae|%ad|%s" --date=iso
            // %H: 完整提交哈希
            // %an: 作者名称
            // %ae: 作者邮箱
            // %ad: 作者日期
            // %s: 提交说明
            const { stdout, stderr } = await execPromise('git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso', {
                cwd: projectRoot,
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            if (stderr) {
                console.warn(`[Git服务] Git命令警告: ${stderr}`);
            }
            // 按行分割提交信息
            const commits = stdout.trim().split('\n').filter(line => line.trim().length > 0);
            return commits;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`获取 Git 提交信息失败: ${errorMessage}`);
        }
    }
    /**
     * 获取详细的 Git 提交信息（包含所有信息）
     * @param projectRoot 项目根目录
     * @returns 格式化的提交信息字符串
     */
    static async getDetailedCommitInfo(projectRoot) {
        // 检查是否是 Git 仓库
        const gitDir = path.join(projectRoot, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('当前目录不是 Git 仓库');
        }
        try {
            // 获取所有提交的详细信息
            // %B: 完整的提交信息（包括主题和正文，保留所有换行）
            // %d: 引用名称（包括 tag、分支等），格式如 (tag: v1.0.0, origin/master)
            // 使用 %B 可以获取完整的提交信息，包括所有换行
            // 使用 %d 可以显示该提交关联的 tag（版本号）
            const { stdout, stderr } = await execPromise('git log --all --pretty=format:"%n========================================%n提交哈希: %H%n版本号（Tag）: %d%n作者: %an <%ae>%n日期: %ad%n提交说明（完整，包含换行）:%n%B" --date=iso', {
                cwd: projectRoot,
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            if (stderr) {
                console.warn(`[Git服务] Git命令警告: ${stderr}`);
            }
            // 处理输出，优化版本号显示
            let processedOutput = stdout;
            // 如果版本号为空（没有 tag），显示提示信息
            processedOutput = processedOutput.replace(/版本号（Tag）:\s*\n/g, '版本号（Tag）: 无\n');
            // 清理多余的括号和空格
            processedOutput = processedOutput.replace(/版本号（Tag）:\s*\(\)/g, '版本号（Tag）: 无');
            processedOutput = processedOutput.replace(/版本号（Tag）:\s*\(/g, '版本号（Tag）: ');
            processedOutput = processedOutput.replace(/\)\n/g, '\n');
            return processedOutput;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`获取详细 Git 提交信息失败: ${errorMessage}`);
        }
    }
    /**
     * 获取用于生成 CHANGELOG 的提交信息
     * @param projectRoot 项目根目录
     * @returns 提交信息数组，每个元素包含版本号、日期、提交说明、作者
     */
    static async getCommitsForChangelog(projectRoot) {
        // 检查是否是 Git 仓库
        const gitDir = path.join(projectRoot, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('当前目录不是 Git 仓库');
        }
        try {
            // 使用特殊分隔符来分割每个提交
            // %d: 引用名称（tag信息）
            // %H: 完整提交哈希（作为版本号的备选）
            // %ad: 作者日期
            // %an: 作者名称
            // %B: 完整的提交信息
            // 使用 CHANGELOG_SEPARATOR 作为每个提交的分隔符
            const { stdout, stderr } = await execPromise('git log --all --pretty=format:"CHANGELOG_SEPARATOR%n%d%n%H%n%ad%n%an%n%B" --date=iso', {
                cwd: projectRoot,
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            if (stderr) {
                console.warn(`[Git服务] Git命令警告: ${stderr}`);
            }
            // 解析提交信息
            const commits = [];
            // 按分隔符分割提交
            const commitBlocks = stdout.split('CHANGELOG_SEPARATOR').filter(block => block.trim().length > 0);
            console.log(`[Git服务] 找到 ${commitBlocks.length} 个提交块`);
            for (const block of commitBlocks) {
                const lines = block.trim().split('\n').filter(line => line.trim().length > 0);
                // 至少需要日期、作者和提交说明
                if (lines.length < 3) {
                    console.log(`[Git服务] 跳过提交块（行数不足）: ${lines.length} 行`);
                    continue;
                }
                // 解析字段顺序：%d（版本信息）、%H（提交哈希）、%ad（日期）、%an（作者）、%B（提交说明）
                let versionLine = lines[0].trim();
                let commitHash = '';
                let dateLine;
                let authorLine;
                let messageStartIndex;
                // 检查第一行是否是日期格式（YYYY-MM-DD HH:MM:SS）
                const datePattern = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/;
                if (datePattern.test(versionLine)) {
                    // 第一行是日期，说明 %d 和 %H 都为空，使用提交哈希作为版本号
                    console.log(`[Git服务] 第一行是日期，%d 和 %H 都为空`);
                    versionLine = '';
                    commitHash = '';
                    dateLine = lines[0].trim();
                    authorLine = lines[1].trim();
                    messageStartIndex = 2;
                }
                else {
                    // 第一行是版本信息（%d）
                    console.log(`[Git服务] 原始版本信息: "${versionLine}"`);
                    // 检查第二行是否是提交哈希（40个字符的十六进制）
                    const hashPattern = /^[0-9a-f]{40}$/i;
                    if (lines.length > 1 && hashPattern.test(lines[1].trim())) {
                        commitHash = lines[1].trim();
                        dateLine = lines[2].trim();
                        authorLine = lines[3].trim();
                        messageStartIndex = 4;
                    }
                    else {
                        // 第二行不是哈希，可能是日期（%d 为空的情况）
                        commitHash = '';
                        dateLine = lines[1].trim();
                        authorLine = lines[2].trim();
                        messageStartIndex = 3;
                    }
                }
                // 提取版本号
                // 优先级：1. tag（最高优先级） 2. 提交哈希 3. -> 后面的分支名
                let versionTag = '无';
                // 1. 优先使用 git 命令获取 tag（最高优先级，最可靠的方法）
                // 只有当有commitHash时才执行git命令
                if (commitHash) {
                    console.log(`[Git服务] 开始为提交 ${commitHash} 查找 tag...`);
                    try {
                        // 方法1: 优先尝试使用 git tag --contains 查找包含该提交的tag（最准确）
                        // 这会返回所有包含该提交的tag，我们取最新的
                        try {
                            console.log(`[Git服务] 尝试方法1: git tag --contains ${commitHash}`);
                            const { stdout: containsOutput, stderr: containsStderr } = await execPromise(`git tag --contains ${commitHash} --sort=-version:refname`, {
                                cwd: projectRoot,
                                maxBuffer: 1024 * 1024 // 1MB buffer
                            });
                            if (containsStderr) {
                                console.log(`[Git服务] git tag --contains 警告: ${containsStderr}`);
                            }
                            const allTags = containsOutput.trim().split('\n').filter(tag => tag.trim().length > 0);
                            console.log(`[Git服务] git tag --contains 找到 ${allTags.length} 个tag: ${allTags.join(', ')}`);
                            if (allTags.length > 0) {
                                // 取第一个tag（按版本号排序后最新的）
                                versionTag = allTags[0].trim();
                                console.log(`[Git服务] 通过 git tag --contains 提取到 tag 版本号: "${versionTag}"`);
                            }
                            else {
                                console.log(`[Git服务] git tag --contains 未找到tag`);
                            }
                        }
                        catch (containsError) {
                            // git tag --contains 失败，继续尝试其他方法
                            const errorMsg = containsError instanceof Error ? containsError.message : String(containsError);
                            console.log(`[Git服务] git tag --contains 失败: ${errorMsg}`);
                        }
                        // 方法2: 如果 --contains 失败，尝试使用 git describe --exact-match 获取精确匹配的tag
                        if (versionTag === '无' || versionTag.trim() === '') {
                            try {
                                console.log(`[Git服务] 尝试方法2: git describe --exact-match --tags ${commitHash}`);
                                const { stdout: exactMatchOutput, stderr: exactMatchStderr } = await execPromise(`git describe --exact-match --tags ${commitHash}`, {
                                    cwd: projectRoot,
                                    maxBuffer: 1024 * 1024 // 1MB buffer
                                });
                                if (exactMatchStderr) {
                                    console.log(`[Git服务] git describe --exact-match 警告: ${exactMatchStderr}`);
                                }
                                const exactTag = exactMatchOutput.trim();
                                if (exactTag) {
                                    versionTag = exactTag;
                                    console.log(`[Git服务] 通过 git describe --exact-match 提取到 tag 版本号: "${versionTag}"`);
                                }
                                else {
                                    console.log(`[Git服务] git describe --exact-match 未找到tag`);
                                }
                            }
                            catch (exactError) {
                                // 精确匹配失败，继续尝试其他方法
                                const errorMsg = exactError instanceof Error ? exactError.message : String(exactError);
                                console.log(`[Git服务] git describe --exact-match 失败: ${errorMsg}`);
                            }
                        }
                        // 方法3: 如果上述方法都失败，尝试使用 git describe --tags 获取最近的tag
                        // 这会返回最近的tag，即使当前提交不是tag本身
                        if (versionTag === '无' || versionTag.trim() === '') {
                            try {
                                console.log(`[Git服务] 尝试方法3: git describe --tags ${commitHash}`);
                                const { stdout: describeOutput, stderr: describeStderr } = await execPromise(`git describe --tags ${commitHash}`, {
                                    cwd: projectRoot,
                                    maxBuffer: 1024 * 1024 // 1MB buffer
                                });
                                if (describeStderr) {
                                    console.log(`[Git服务] git describe --tags 警告: ${describeStderr}`);
                                }
                                const describedTag = describeOutput.trim();
                                if (describedTag) {
                                    // git describe 可能返回 "v1.0.0-5-gabc1234" 这样的格式
                                    // 我们只取tag部分（第一个连字符之前的部分）
                                    const tagMatch = describedTag.match(/^([^-]+)/);
                                    if (tagMatch && tagMatch[1]) {
                                        versionTag = tagMatch[1];
                                        console.log(`[Git服务] 通过 git describe --tags 提取到 tag 版本号: "${versionTag}"`);
                                    }
                                    else {
                                        console.log(`[Git服务] git describe --tags 返回格式无法解析: "${describedTag}"`);
                                    }
                                }
                                else {
                                    console.log(`[Git服务] git describe --tags 未找到tag`);
                                }
                            }
                            catch (describeError) {
                                // git describe 失败，继续尝试其他方法
                                const errorMsg = describeError instanceof Error ? describeError.message : String(describeError);
                                console.log(`[Git服务] git describe --tags 失败: ${errorMsg}`);
                            }
                        }
                        // 方法4: 如果git命令都失败，尝试从 %d 格式中提取tag（备用方法）
                        if ((versionTag === '无' || versionTag.trim() === '') && versionLine) {
                            console.log(`[Git服务] 尝试方法4: 从 %d 格式提取tag，原始版本信息: "${versionLine}"`);
                            // 移除首尾的括号和空格
                            const cleanedVersion = versionLine.replace(/^[\(\s]+|[\)\s]+$/g, '');
                            // 优先查找 tag: 后面的内容（支持多个tag，取第一个）
                            // 匹配格式：tag: v1.0.0 或 tag:v1.0.0
                            const tagMatch = cleanedVersion.match(/tag:\s*([^,)]+)/i);
                            if (tagMatch && tagMatch[1]) {
                                versionTag = tagMatch[1].trim();
                                console.log(`[Git服务] 从 %d 格式提取到 tag 版本号: "${versionTag}"`);
                            }
                            else {
                                console.log(`[Git服务] %d 格式中未找到tag信息`);
                            }
                        }
                    }
                    catch (error) {
                        // 所有tag查找方法都失败，忽略错误
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        console.log(`[Git服务] 所有tag查找方法都失败: ${errorMsg}`);
                    }
                    console.log(`[Git服务] 最终确定的版本号: "${versionTag}"`);
                }
                // 2. 如果没有 tag，才使用提交哈希作为版本号（取前8位）
                if (versionTag === '无' || versionTag.trim() === '') {
                    if (commitHash) {
                        versionTag = commitHash.substring(0, 8);
                        console.log(`[Git服务] 使用提交哈希作为版本号: "${versionTag}"`);
                    }
                    else {
                        // 3. 如果连提交哈希都没有，尝试使用分支名
                        if (versionLine) {
                            const cleanedVersion = versionLine.replace(/^[\(\s]+|[\)\s]+$/g, '');
                            const branchMatch = cleanedVersion.match(/->\s*([^,)]+)/);
                            if (branchMatch) {
                                versionTag = branchMatch[1].trim();
                                console.log(`[Git服务] 使用分支名作为版本号: "${versionTag}"`);
                            }
                            else {
                                versionTag = '无';
                                console.log(`[Git服务] 无版本号，将不显示版本号行`);
                            }
                        }
                        else {
                            versionTag = '无';
                            console.log(`[Git服务] 无版本号，将不显示版本号行`);
                        }
                    }
                }
                // 日期（只取年月日部分）
                let date = dateLine;
                // 提取日期部分（YYYY-MM-DD），忽略时分秒
                const dateOnlyMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
                if (dateOnlyMatch) {
                    date = dateOnlyMatch[1];
                }
                // 作者
                const author = authorLine;
                // 剩余行：提交说明
                const message = lines.slice(messageStartIndex).join('\n').trim();
                commits.push({
                    version: versionTag,
                    date: date,
                    message: message,
                    author: author
                });
            }
            // git log 默认是从新到旧，直接返回
            return commits;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`获取提交信息失败: ${errorMessage}`);
        }
    }
    /**
     * 生成 CHANGELOG.md 内容
     * @param projectRoot 项目根目录
     * @returns CHANGELOG.md 文件内容
     */
    static async generateChangelog(projectRoot) {
        const commits = await this.getCommitsForChangelog(projectRoot);
        if (commits.length === 0) {
            return '# 更新日志\n\n暂无版本记录。\n';
        }
        let changelog = '# 更新日志\n\n\n';
        let lastVersion = '';
        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];
            // 如果遇到新的版本号，添加分割线
            if (i > 0 && commit.version !== lastVersion && commit.version !== '无' && lastVersion !== '无') {
                changelog += '\n---\n\n';
            }
            // 生成提交记录
            // 如果版本号不是"无"，才显示版本号行
            if (commit.version !== '无' && commit.version.trim() !== '') {
                changelog += `${commit.version}\n\n\n`;
            }
            changelog += `日期: ${commit.date}\n\n`;
            changelog += `提交说明:\n\n\n`;
            // 提交说明需要缩进（4个空格）
            const indentedMessage = commit.message
                .split('\n')
                .map(line => line.trim() === '' ? '' : `    ${line}`)
                .join('\n');
            changelog += `${indentedMessage}\n\n\n`;
            changelog += `作者: ${commit.author}\n`;
            // 如果不是最后一个，添加空行分割
            if (i < commits.length - 1) {
                changelog += '\n';
            }
            lastVersion = commit.version;
        }
        return changelog;
    }
    /**
     * 查找文件所在的 Git 仓库根目录
     * @param filePath 文件路径
     * @returns Git 仓库根目录，如果未找到则返回 null
     */
    static findGitRoot(filePath) {
        let currentPath = filePath;
        // 如果是文件，获取其所在目录
        if (fs.existsSync(currentPath) && fs.statSync(currentPath).isFile()) {
            currentPath = path.dirname(currentPath);
        }
        // 向上查找直到找到 .git 目录或到达根目录
        while (currentPath !== path.dirname(currentPath)) {
            const gitDir = path.join(currentPath, '.git');
            if (fs.existsSync(gitDir)) {
                return currentPath;
            }
            currentPath = path.dirname(currentPath);
        }
        return null;
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map