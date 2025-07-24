# Node.js GitHub Profile Updater - 使用指南

## 📋 步骤

1. **Fork 项目**

   - 将此仓库 fork 到你的 GitHub 账户
   - 将仓库重命名为你的 GitHub 用户名

2. **启用 GitHub Actions**

   - 进入你的仓库
   - 点击 `Actions` 标签页
   - 启用 "Update Profile" 工作流

3. **配置 Secrets（可选）**

   - 进入仓库的 Settings > Secrets and variables > Actions
   - 添加以下 secrets：
     - `TOP_REPO_NUM`: 显示 Top 项目数量（默认 10）
     - `RECENT_REPO_NUM`: 显示最近更新项目数量（默认 10）
     - `TIMEZONE`: 时区设置（默认 Asia/Shanghai）

4. **手动触发更新**
   - 进入 Actions 页面
   - 点击 `Update Profile` 工作流
   - 点击 `Run workflow` 手动触发更新

## ⚙️ 自定义配置

### 修改调度时间

编辑 `.github/workflows/update.yml` 文件中的 cron 表达式：

```yaml
on:
  schedule:
    - cron: "0 12 * * SUN" # 每周日中午 12 点
```

### 修改显示项目数量

通过环境变量或 GitHub Secrets 设置：

```bash
# 环境变量
TOP_REPO_NUM=15
RECENT_REPO_NUM=15

# 或在 GitHub Secrets 中设置
```

### 修改时区

```bash
# 环境变量
TIMEZONE=America/New_York

# 或在 GitHub Secrets 中设置
```

## 🔧 本地开发

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 构建项目
npm run build
```

### 环境变量配置

创建 `.env` 文件：

```env
GITHUB_USERNAME=your-username
GITHUB_TOKEN=your-token
TOP_REPO_NUM=10
RECENT_REPO_NUM=10
TIMEZONE=Asia/Shanghai
DEBUG=false
```

## 📊 展示效果

更新后的 README.md 将包含：

- GitHub 统计卡片
- 编程语言统计
- LeetCode 数据
- 技能图标展示
- Top 项目列表
- 最近更新项目列表

## 🐛 故障排除

### 常见问题

1. **Actions 未运行**

   - 检查是否启用了 Actions
   - 确认仓库是公开的或已配置 Actions 权限

2. **API 限制错误**

   - 添加 GitHub Token 到 Secrets
   - 检查 API 调用频率

3. **时区显示错误**
   - 检查 TIMEZONE 设置
   - 确认 GitHub Actions 时区配置

### 调试模式

设置 `DEBUG=true` 环境变量可以跳过 Git 提交，仅更新 README.md 文件。

## 📞 支持

如果遇到问题，请：

1. 检查 GitHub Actions 日志
2. 查看项目 Issues
3. 提交新的 Issue 描述问题

---

🎉 完成以上步骤后，你的 GitHub Profile 将自动更新！
