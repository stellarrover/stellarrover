#!/usr/bin/env node

import dotenv from 'dotenv';
import { GitHubClient } from './github';
import { MarkdownRenderer } from './renderer';
import {
    getConfig,
    getCurrentTime,
    writeFile,
    setupGitConfig,
    commitAndPush
} from './utils';

// 加载环境变量
dotenv.config();

class ProfileUpdater {
    private githubClient: GitHubClient;
    private renderer: MarkdownRenderer;
    private config: ReturnType<typeof getConfig>;

    constructor() {
        this.config = getConfig();
        this.githubClient = new GitHubClient(process.env.GITHUB_TOKEN);
        this.renderer = new MarkdownRenderer();
    }

    /**
     * 主更新流程
     */
    async update(): Promise<void> {
        try {
            console.log('🚀 Starting GitHub Profile update...');
            console.log(`👤 Target user: ${this.config.githubUsername}`);
            console.log(`⏰ Current time: ${getCurrentTime(this.config.timezone)}`);

            // 检查 API 限制
            await this.githubClient.checkRateLimit();

            // 获取 GitHub 数据
            const githubData = await this.githubClient.fetchGitHubData(
                this.config.githubUsername,
                this.config.topRepoNum,
                this.config.recentRepoNum
            );

            // 生成 Markdown 内容
            const currentTime = getCurrentTime(this.config.timezone);
            const markdown = this.renderer.render({
                githubUsername: this.config.githubUsername,
                githubData,
                currentTime
            });

            // 写入 README.md 文件
            const success = await writeFile('./README.md', markdown);
            if (!success) {
                throw new Error('Failed to write README.md');
            }

            console.log('✅ README.md updated successfully');

            // 设置 Git 配置
            await setupGitConfig();

            // 提交并推送更改
            await commitAndPush(currentTime);

            console.log('🎉 Profile update completed successfully!');

        } catch (error) {
            console.error('❌ Profile update failed:', error);
            process.exit(1);
        }
    }

    /**
     * 显示帮助信息
     */
    showHelp(): void {
        console.log(`
GitHub Profile Updater

Usage:
  npm start                    # Run the updater
  npm run dev                 # Run in development mode
  npm run build              # Build TypeScript to JavaScript

Environment Variables:
  GITHUB_USERNAME            # GitHub username (auto-detected from repo name if not set)
  GITHUB_TOKEN              # GitHub API token (optional, for higher rate limits)
  TOP_REPO_NUM              # Number of top repos to show (default: 10)
  RECENT_REPO_NUM           # Number of recent repos to show (default: 10)
  TIMEZONE                  # Timezone for timestamps (default: Asia/Shanghai)
  DEBUG                     # Enable debug mode (skips git commit/push)

Examples:
  GITHUB_USERNAME=yourname npm start
  GITHUB_TOKEN=your_token npm start
  DEBUG=true npm start
    `);
    }
}

// 主函数
async function main(): Promise<void> {
    const updater = new ProfileUpdater();

    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        updater.showHelp();
        return;
    }

    // 运行更新
    await updater.update();
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// 运行主程序
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
} 