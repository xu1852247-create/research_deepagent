# 欧姆定律 · 交互学习

初中物理交互式 Web APP 首批最小样例（欧姆定律章）。
React + TypeScript + Vite + Tailwind CSS + shadcn/ui，数值计算全部在前端完成，不依赖后端。

## 运行

```bash
npm install        # 首次
npm run dev        # 开发预览（默认 http://localhost:3000）
npm run build      # 生产构建 → dist/
node scripts/verify-questions.mjs   # 题库与物理数值校验
```

> WSL2 下请使用 `npm run dev -- --host`，端口会自动转发到 Windows 浏览器。

## 功能

- **学习讲解**：生活情境 → 定义 → 公式 → 例题（固定教学顺序）。
- **交互实验**：串联电路（电源 6 V + 定值电阻 + 滑动变阻器 20 Ω），
  实验一保持 R=10 Ω 探究 I-U 关系；实验二更换 R（5/10/15/20 Ω）并保持电压表示数 3.0 V 探究 I-R 关系。
  滑片、读数、描点图表实时联动；实验记录保存在本地。
- **误区辨析**：电流被电阻消耗 / 电压就是电流 / 滑变改变定值电阻，3 个互动判断。
- **题库练习**：10 道自编题（选择 + 计算），判分、解析、验算式、误区标签，答题记录保存在本地。
- **功能路线图**：已实现与待实现明确标注。

## 结构

```
src/physics/ohm.ts            物理计算纯函数模块（仿真与题库共用）
src/data/questions/           题库 JSON（统一 schema）
src/components/               CircuitDiagram（电路图 SVG）、PointChart（描点图表）
src/sections/                 学习讲解 / 交互实验 / 误区辨析 / 题库练习 / 路线图
scripts/verify-questions.mjs  题库字段与验算式校验
```

## 理想化假设与待核事项

- 理想化假设：电源无内阻、理想电表、导线电阻为零、电阻不随温度变化。
- 教材依据：人教版九年级全一册第十七章《欧姆定律》，**版次待确认**。
- 全部题目为自编，**待教师审核**。
