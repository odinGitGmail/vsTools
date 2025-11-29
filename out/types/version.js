"use strict";
/**
 * 版本号相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionUpdateType = void 0;
/**
 * 版本号更新类型
 */
var VersionUpdateType;
(function (VersionUpdateType) {
    /** 补丁版本（例如: 0.0.3 -> 0.0.4） */
    VersionUpdateType["Patch"] = "patch";
    /** 次版本（例如: 0.0.3 -> 0.1.0） */
    VersionUpdateType["Minor"] = "minor";
    /** 主版本（例如: 0.0.3 -> 1.0.0） */
    VersionUpdateType["Major"] = "major";
    /** 自定义版本号 */
    VersionUpdateType["Custom"] = "custom";
})(VersionUpdateType || (exports.VersionUpdateType = VersionUpdateType = {}));
//# sourceMappingURL=version.js.map