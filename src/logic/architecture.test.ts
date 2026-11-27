import { describe, expect, it } from 'vitest';

const logicSourceFiles = import.meta.glob<string>(['./**/*.ts', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** 去除單行與區塊註解，避免 JSDoc 說明文字造成誤報 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

interface ForbiddenRule {
  label: string;
  pattern: RegExp;
}

const FORBIDDEN_IMPORT_RULES: ForbiddenRule[] = [
  {
    label: '禁止引入 react / react-dom',
    pattern: /(?:from|import|require\s*\()\s*['"]react(?:-dom)?(?:\/[^'"]*)?['"]/,
  },
  {
    label: '禁止引入 src/components',
    pattern: /(?:from|import|require\s*\()\s*['"][^'"]*(?:^|\/)components(?:\/[^'"]*)?['"]/,
  },
  {
    label: '禁止引入 src/store',
    pattern: /(?:from|import|require\s*\()\s*['"][^'"]*(?:^|\/)store(?:\/[^'"]*)?['"]/,
  },
];

const FORBIDDEN_BROWSER_GLOBAL_RULES: ForbiddenRule[] = [
  {
    label: '禁止直接操作 window',
    pattern: /\bwindow\s*(?:\.|\[|\?\.)/,
  },
  {
    label: '禁止直接操作 document',
    pattern: /\bdocument\s*(?:\.|\[|\?\.)/,
  },
  {
    label: '禁止直接操作 localStorage',
    pattern: /\blocalStorage\b/,
  },
  {
    label: '禁止直接操作 sessionStorage',
    pattern: /\bsessionStorage\b/,
  },
];

describe('架構邊界自動化守衛（src/logic/ 純規則引擎隔離）', () => {
  const entries = Object.entries(logicSourceFiles);

  it('應掃描到 src/logic/（含 types/ 子模組）所有純邏輯原始碼檔案', () => {
    const paths = entries.map(([relPath]) => relPath);
    expect(paths.length).toBeGreaterThan(20);
    expect(paths).toContain('./types/seat.ts');
    expect(paths).toContain('./types.ts');
    expect(paths.every((p) => !p.endsWith('.test.ts'))).toBe(true);
  });

  it('src/logic/ 底下所有 .ts 檔嚴禁引入 react、react-dom、components 或 store', () => {
    const violations: string[] = [];
    for (const [relPath, rawSource] of entries) {
      const code = stripComments(rawSource);
      for (const rule of FORBIDDEN_IMPORT_RULES) {
        if (rule.pattern.test(code)) {
          violations.push(`${relPath}: ${rule.label}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('src/logic/ 底下所有 .ts 檔嚴禁直接操作瀏覽器 window / document / localStorage', () => {
    const violations: string[] = [];
    for (const [relPath, rawSource] of entries) {
      const code = stripComments(rawSource);
      for (const rule of FORBIDDEN_BROWSER_GLOBAL_RULES) {
        if (rule.pattern.test(code)) {
          violations.push(`${relPath}: ${rule.label}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
