import { describe, expect, it } from "vitest";
import { getLicenseInfo, isAllowedLicense, licenseRejectionReason } from "./license";

describe("协议白名单", () => {
  it("接受白名单内的协议", () => {
    expect(isAllowedLicense("MIT")).toBe(true);
    expect(isAllowedLicense("Apache-2.0")).toBe(true);
    expect(isAllowedLicense("CC-BY-SA-4.0")).toBe(true);
    expect(isAllowedLicense("cc-by-4.0")).toBe(true);
  });

  it("拒绝无法识别、非商业与强传染性协议", () => {
    expect(isAllowedLicense(null)).toBe(false);
    expect(isAllowedLicense("")).toBe(false);
    expect(isAllowedLicense("NOASSERTION")).toBe(false);
    expect(isAllowedLicense("GPL-3.0")).toBe(false);
    expect(isAllowedLicense("AGPL-3.0")).toBe(false);
    expect(isAllowedLicense("CC-BY-NC-SA-4.0")).toBe(false);
  });

  it("标注 CC-BY-SA 需要相同方式共享", () => {
    expect(getLicenseInfo("CC-BY-SA-4.0")?.shareAlike).toBe(true);
    expect(getLicenseInfo("MIT")?.shareAlike).toBe(false);
    expect(getLicenseInfo("CC0-1.0")?.attributionRequired).toBe(false);
  });

  it("给出可读的拒绝原因", () => {
    expect(licenseRejectionReason(null)).toContain("未提供");
    expect(licenseRejectionReason("NOASSERTION")).toContain("NOASSERTION");
    expect(licenseRejectionReason("GPL-3.0")).toContain("强传染性");
    expect(licenseRejectionReason("CC-BY-NC-SA-4.0")).toContain("非商业");
    expect(licenseRejectionReason("WTFPL")).toContain("白名单");
  });
});
