# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
# 孕期血糖记录

## 项目介绍

这是一个基于 React + TypeScript + Vite 的项目，用于记录孕妇的血糖数据。
数据保存在本地，数据清空无法恢复。
可以定期导出备份数据，包括导出为 Excel 文件、json 文件等。

## 记录页面

记录页面是用户输入血糖数据的页面，用户可以在该页面输入血糖值、时间、备注等信息。
用户可以点击“提交”按钮将数据提交到服务器。

## 查看页面

查看页面是用户查看已记录血糖数据的页面，用户可以在该页面查看已记录的血糖数据，包括血糖值、时间、备注等信息。
用户可以点击“删除”按钮删除已记录的血糖数据。

## 统计页面

统计页面是用户查看已记录血糖数据的统计信息的页面，用户可以在该页面查看已记录的血糖数据的统计信息，包括平均血糖值、最大血糖值、最小血糖值等。
用户可以点击“导出”按钮导出已记录的血糖数据。

## 更多功能

- 用户可以导出已记录的血糖数据，包括导出为 Excel 文件、json 文件等。
- 数据设置-用户可以导入历史血糖数据，包括导入 Excel 文件、json 文件等。
- 数据设置-用户可以一键清空历史数据，清空数据后无法恢复。

📊 核心功能

- 血糖数据记录与管理（2.0-50.0范围，保留2位小数）
- 餐段自动判断（空腹、早餐、午餐、晚餐、睡前）
- 运动记录（支持时间/距离两种模式）
- Excel数据导入（支持简单和复杂格式）
- 体重记录与统计
- 数据可视化（血糖对比柱状图、体重折线图）
🎯 交互特性

- 时间-餐段联动选择
- 高频率餐食选项自动生成
- 测量时间精确到分钟显示
🛠 技术栈

- React 18 + TypeScript
- TailwindCSS 3
- Zustand 状态管理
- Recharts 图表库
- SheetJS Excel处理