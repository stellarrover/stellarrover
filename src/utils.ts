import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment-timezone';
import { Config } from './types';

/**
 * 获取当前时间字符串
 */
export function getCurrentTime(timezone: string = 'Asia/Shanghai'): string {
    return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化时间用于 badge
 */
export function formatTimeForBadge(dateString: string): string {
    return dateString.replace(/-/g, '--').replace(/ /g, '-').replace(/:/g, '%3A');
}

/**
 * 从环境变量或当前目录名获取 GitHub 用户名
 */
export function getGitHubUsername(): string {
    const envUsername = process.env.GITHUB_USERNAME;
    if (envUsername) {
        return envUsername;
    }

    // 从当前目录名获取用户名
    const cwd = process.cwd();
    const dirName = path.basename(cwd);
    return dirName;
}

/**
 * 获取配置
 */
export function getConfig(): Config {
    return {
        githubUsername: getGitHubUsername(),
        topRepoNum: parseInt(process.env.TOP_REPO_NUM || '10'),
        recentRepoNum: parseInt(process.env.RECENT_REPO_NUM || '10'),
        timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    };
}

/**
 * 写入文件
 */
export function writeFile(filePath: string, content: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Successfully wrote to ${filePath}`);
            resolve(true);
        } catch (error) {
            console.error(`❌ Error writing to ${filePath}:`, error);
            resolve(false);
        }
    });
}

/**
 * 执行 Git 命令
 */
export function executeGitCommand(command: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(command, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.error(`❌ Git command failed: ${command}`, error);
                resolve(false);
                return;
            }
            console.log(`✅ Git command executed: ${command}`);
            resolve(true);
        });
    });
}



/**
 * 设置 Git 配置
 */
export async function setupGitConfig(): Promise<void> {
    const gitUser = process.env.GIT_USER || 'GitHub Actions';
    const gitEmail = process.env.GIT_EMAIL || 'action@github.com';

    await executeGitCommand(`git config user.name "${gitUser}"`);
    await executeGitCommand(`git config user.email "${gitEmail}"`);

    // 设置远程仓库 URL（用于 GitHub Actions）
    const githubToken = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;

    if (githubToken && repository) {
        const remoteUrl = `https://x-access-token:${githubToken}@github.com/${repository}.git`;
        await executeGitCommand(`git remote set-url origin ${remoteUrl}`);
    } else if (githubToken) {
        // 如果没有 GITHUB_REPOSITORY 环境变量，尝试从当前目录推断
        const cwd = process.cwd();
        const dirName = path.basename(cwd);
        const remoteUrl = `https://x-access-token:${githubToken}@github.com/stellarrover/${dirName}.git`;
        await executeGitCommand(`git remote set-url origin ${remoteUrl}`);
    }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            console.log(`⚠️ Retry ${i + 1}/${maxRetries} after error:`, error);
            await delay(delayMs * (i + 1)); // 指数退避
        }
    }
    throw new Error('Max retries exceeded');
} 