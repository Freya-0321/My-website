import type { Config } from "tailwindcss";

// 设计令牌：面向「AI 可见度监测」主题的自定义配色与字体系统
// 主色调借用雷达扫描 / 信号强度的意象：靛蓝为基调，信号琥珀色作为强调色
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101728",        // 主文本 / 深色背景
        paper: "#F4F6F8",      // 页面底色（冷白，非暖米色）
        panel: "#FFFFFF",      // 卡片底色
        signal: "#E8A33D",     // 强调色：信号琥珀（代表得分/关注点）
        radar: "#155E63",      // 次强调色：雷达深青（代表稳定/优良）
        alert: "#C24444",      // 告警红
        line: "#DDE3E8",       // 分割线
        muted: "#5B6675",      // 次要文本
        "ink-dark": "#0B0F17", // 深色模式背景
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,23,40,0.04), 0 4px 16px rgba(16,23,40,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
