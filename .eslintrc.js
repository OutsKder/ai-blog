module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // 禁用未使用变量警告
    '@typescript-eslint/no-unused-vars': 'off',
    // 禁用 any 类型警告
    '@typescript-eslint/no-explicit-any': 'off',
    // 禁用 ts-nocheck 警告
    '@typescript-eslint/ban-ts-comment': 'off',
    // 允许客户端组件使用 async
    '@next/next/no-async-client-component': 'off'
  }
}; 