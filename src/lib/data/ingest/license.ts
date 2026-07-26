// 开源协议白名单与校验
//
// 抓取脚本只接受 GitHub API 能机器识别（license.spdx_id）且在白名单内的仓库。
// 任何 NOASSERTION / 无 LICENSE / 非商业(NC) / 强传染性(GPL 系) 的仓库一律跳过，
// 这样"题目来自合法可再分发内容"这件事是可验证的，而不是靠人工声明。

export interface LicenseInfo {
  /** SPDX 标识 */
  spdx: string;
  /** 中文展示名 */
  label: string;
  /** 协议原文链接 */
  url: string;
  /** 是否要求署名 */
  attributionRequired: boolean;
  /** 是否要求相同方式共享（CC-BY-SA 系） */
  shareAlike: boolean;
}

export const ALLOWED_LICENSES: Record<string, LicenseInfo> = {
  "MIT": {
    spdx: "MIT",
    label: "MIT",
    url: "https://opensource.org/licenses/MIT",
    attributionRequired: true,
    shareAlike: false,
  },
  "APACHE-2.0": {
    spdx: "Apache-2.0",
    label: "Apache License 2.0",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
    attributionRequired: true,
    shareAlike: false,
  },
  "BSD-2-CLAUSE": {
    spdx: "BSD-2-Clause",
    label: "BSD 2-Clause",
    url: "https://opensource.org/licenses/BSD-2-Clause",
    attributionRequired: true,
    shareAlike: false,
  },
  "BSD-3-CLAUSE": {
    spdx: "BSD-3-Clause",
    label: "BSD 3-Clause",
    url: "https://opensource.org/licenses/BSD-3-Clause",
    attributionRequired: true,
    shareAlike: false,
  },
  "ISC": {
    spdx: "ISC",
    label: "ISC",
    url: "https://opensource.org/licenses/ISC",
    attributionRequired: true,
    shareAlike: false,
  },
  "CC0-1.0": {
    spdx: "CC0-1.0",
    label: "CC0 1.0（公共领域）",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    attributionRequired: false,
    shareAlike: false,
  },
  "UNLICENSE": {
    spdx: "Unlicense",
    label: "The Unlicense",
    url: "https://unlicense.org/",
    attributionRequired: false,
    shareAlike: false,
  },
  "CC-BY-4.0": {
    spdx: "CC-BY-4.0",
    label: "CC BY 4.0（署名）",
    url: "https://creativecommons.org/licenses/by/4.0/",
    attributionRequired: true,
    shareAlike: false,
  },
  "CC-BY-3.0": {
    spdx: "CC-BY-3.0",
    label: "CC BY 3.0（署名）",
    url: "https://creativecommons.org/licenses/by/3.0/",
    attributionRequired: true,
    shareAlike: false,
  },
  "CC-BY-SA-4.0": {
    spdx: "CC-BY-SA-4.0",
    label: "CC BY-SA 4.0（署名-相同方式共享）",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
    attributionRequired: true,
    shareAlike: true,
  },
  "CC-BY-SA-3.0": {
    spdx: "CC-BY-SA-3.0",
    label: "CC BY-SA 3.0（署名-相同方式共享）",
    url: "https://creativecommons.org/licenses/by-sa/3.0/",
    attributionRequired: true,
    shareAlike: true,
  },
};

/**
 * 判断 GitHub 返回的 spdx_id 是否可用。
 * null / "NOASSERTION" / 未收录的协议一律视为不可用。
 */
export function isAllowedLicense(spdx: string | null | undefined): boolean {
  return getLicenseInfo(spdx) !== null;
}

export function getLicenseInfo(spdx: string | null | undefined): LicenseInfo | null {
  if (typeof spdx !== "string") return null;
  const key = spdx.trim().toUpperCase();
  if (key === "" || key === "NOASSERTION" || key === "NONE") return null;
  return ALLOWED_LICENSES[key] ?? null;
}

/** 拒绝原因，用于抓取报告 */
export function licenseRejectionReason(spdx: string | null | undefined): string {
  if (typeof spdx !== "string" || spdx.trim() === "") {
    return "仓库未提供可识别的 LICENSE 文件";
  }
  const key = spdx.trim().toUpperCase();
  if (key === "NOASSERTION" || key === "NONE") {
    return "LICENSE 无法被 GitHub 识别（NOASSERTION）";
  }
  if (key.includes("NC")) {
    return `${spdx} 为非商业协议，不纳入`;
  }
  if (key.startsWith("GPL") || key.startsWith("AGPL") || key.startsWith("LGPL")) {
    return `${spdx} 为强传染性协议，不纳入`;
  }
  return `${spdx} 不在白名单内`;
}
