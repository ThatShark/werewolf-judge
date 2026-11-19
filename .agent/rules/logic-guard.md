---
trigger: always_on
---

# 規則邏輯防護規範（Logic Guard）

針對 `src/logic/` 目錄下的純規則運算程式碼，必須嚴格遵守以下防護條款：

## 1. 嚴禁引入 React UI 元件
- `src/logic/` 僅限撰寫純 TypeScript 邏輯與資料模型（`.ts`），**嚴禁**引入任何 React 相關套件（例如 `react`、`react-dom`）或 `src/components/` 內的 UI 元件。
- 邏輯層必須保持與畫面層完全解耦，以便獨立進行單元測試與未來跨平台重用。

## 2. 測試同步與強制通過
- 每次新增、修改或重構 `src/logic/` 內的任何規則邏輯時，**必須同步新增或更新**對應的 Vitest 單元測試檔案（`*.test.ts`）。
- 變更完成後，必須執行 `npm run test` 並確認所有測試案例全數通過，嚴禁在測試失敗的情況下結束任務。
