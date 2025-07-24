// GitHub API 相关类型定义
export interface GitHubUser {
    name: string;
    public_repos: number;
    login: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    watchers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    fork: boolean;
    language: string | null;
}

export interface ProcessedRepo {
    name: string;
    description: string;
    link: string;
    star: number;
    score: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    language: string | null;
}

export interface GitHubData {
    name: string;
    public_repos: number;
    top_repos: ProcessedRepo[];
    recent_repos: ProcessedRepo[];
}

// 配置相关类型
export interface Config {
    githubUsername: string;
    topRepoNum: number;
    recentRepoNum: number;
    timezone: string;
}

// 渲染相关类型
export interface RenderOptions {
    githubUsername: string;
    githubData: GitHubData;
    currentTime: string;
}

// API 响应类型
export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
} 