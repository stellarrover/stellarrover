import axios, { AxiosInstance, AxiosResponse } from 'axios';
import moment from 'moment-timezone';
import { GitHubUser, GitHubRepo, GitHubData, ProcessedRepo } from './types';
import { retry } from './utils';

export class GitHubClient {
    private client: AxiosInstance;
    private token: string;

    constructor(token: string = '') {
        this.token = token;
        this.client = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'nodejs-profile-updater'
            }
        });

        // 添加认证头
        if (this.token) {
            this.client.defaults.headers.common['Authorization'] = `token ${this.token}`;
        }

        // 添加请求拦截器
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🌐 Making request to: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request error:', error);
                return Promise.reject(error);
            }
        );

        // 添加响应拦截器
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Response received: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                console.error('❌ Response error:', error.response?.status, error.response?.statusText);
                return Promise.reject(error);
            }
        );
    }

    /**
     * 获取用户信息
     */
    async getUser(username: string): Promise<GitHubUser> {
        const response = await retry(() =>
            this.client.get<GitHubUser>(`/users/${username}`)
        );
        return response.data;
    }

    /**
     * 获取用户的所有仓库
     */
    async getUserRepos(username: string): Promise<GitHubRepo[]> {
        const repos: GitHubRepo[] = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const response = await retry(() =>
                this.client.get<GitHubRepo[]>(`/users/${username}/repos`, {
                    params: {
                        per_page: perPage,
                        page: page,
                        sort: 'updated'
                    }
                })
            );

            const pageRepos = response.data;
            repos.push(...pageRepos);

            // 如果返回的仓库数少于每页数量，说明已经到最后一页
            if (pageRepos.length < perPage) {
                break;
            }

            page++;

            // 添加延迟避免触发 API 限制
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return repos;
    }

    /**
     * 处理仓库数据
     */
    private processRepos(repos: GitHubRepo[]): ProcessedRepo[] {
        return repos
            .filter(repo => !repo.fork) // 过滤掉 fork 的仓库
            .map(repo => {
                const score = repo.stargazers_count + repo.watchers_count + repo.forks_count;

                // 转换时区
                const pushedAt = moment.utc(repo.pushed_at)
                    .tz('Asia/Shanghai')
                    .format('YYYY-MM-DD HH:mm:ss');

                return {
                    name: repo.name,
                    description: repo.description || 'No description',
                    link: repo.html_url,
                    star: repo.stargazers_count,
                    score: score,
                    created_at: repo.created_at,
                    updated_at: repo.updated_at,
                    pushed_at: pushedAt,
                    language: repo.language
                };
            });
    }

    /**
     * 获取完整的 GitHub 数据
     */
    async fetchGitHubData(username: string, topRepoNum: number, recentRepoNum: number): Promise<GitHubData> {
        console.log(`🔍 Fetching data for user: ${username}`);

        // 获取用户信息
        const user = await this.getUser(username);
        console.log(`👤 User found: ${user.name} (${user.public_repos} public repos)`);

        // 获取所有仓库
        const repos = await this.getUserRepos(username);
        console.log(`📦 Found ${repos.length} repositories`);

        // 处理仓库数据
        const processedRepos = this.processRepos(repos);
        console.log(`✨ Processed ${processedRepos.length} non-fork repositories`);

        // 按星标数排序获取 Top 仓库
        const topRepos = processedRepos
            .sort((a, b) => b.star - a.star)
            .slice(0, topRepoNum);

        // 按更新时间排序获取最近更新的仓库
        const recentRepos = processedRepos
            .sort((a, b) => moment(b.pushed_at).valueOf() - moment(a.pushed_at).valueOf())
            .slice(0, recentRepoNum);

        return {
            name: user.name,
            public_repos: user.public_repos,
            top_repos: topRepos,
            recent_repos: recentRepos
        };
    }

    /**
     * 检查 API 限制
     */
    async checkRateLimit(): Promise<void> {
        try {
            const response = await this.client.get('/rate_limit');
            const { rate } = response.data;

            console.log(`📊 Rate limit: ${rate.remaining}/${rate.limit} requests remaining`);
            console.log(`⏰ Reset time: ${new Date(rate.reset * 1000).toLocaleString()}`);

            if (rate.remaining < 10) {
                console.warn('⚠️ Warning: Rate limit is running low!');
            }
        } catch (error) {
            console.warn('⚠️ Could not check rate limit:', error);
        }
    }
} 