import { RenderOptions, ProcessedRepo } from './types';
import { formatTimeForBadge } from './utils';

export class MarkdownRenderer {
    /**
 * 渲染抽象部分（统计卡片）
 */
    private renderAbstract(options: RenderOptions): string {
        const { githubUsername, githubData } = options;

        return `## Abstract
<p>
  <img src="https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&hide_border=true" alt="${githubData.name}'s Github Stats" width="58%" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUsername}&layout=compact&hide_border=true&langs_count=10" alt="${githubData.name}'s Top Langs" width="37%" /> 
</p>

<a href="https://github.com/songquanpeng/stats-cards">
<p>
  <img src="https://stats.justsong.cn/api/leetcode/?username=quanpeng&theme=light" alt="JustSong's LeetCode Stats" width="49%" />
</p>
</a>

![skills](https://skillicons.dev/icons?i=c,cpp,go,py,html,css,js,nodejs,java,md,pytorch,tensorflow,flask,fastapi,express,qt,react,cmake,docker,git,linux,nginx,mysql,redis,sqlite,githubactions,heroku,vercel,visualstudio,vscode)

`;
    }

    /**
     * 渲染 Top 项目表格
     */
    private renderTopProjects(repos: ProcessedRepo[]): string {
        let table = `\n## Top Projects
|Project|Description|Stars|
|:--|:--|:--|
`;

        for (const repo of repos) {
            const description = repo.description || 'No description';
            table += `|[${repo.name}](${repo.link})|${description}|${repo.star}⭐|\n`;
        }

        return table;
    }

    /**
     * 渲染最近更新项目表格
     */
    private renderRecentUpdates(repos: ProcessedRepo[]): string {
        let table = `\n## Recent Updates
|Project|Description|Last Update|
|:--|:--|:--|
`;

        for (const repo of repos) {
            const description = repo.description || 'No description';
            const dateForBadge = formatTimeForBadge(repo.pushed_at);
            table += `|[${repo.name}](${repo.link})|${description}|![${repo.pushed_at}](https://img.shields.io/badge/${dateForBadge}-brightgreen?style=flat-square)|\n`;
        }

        return table;
    }

    /**
     * 渲染页脚
     */
    private renderFooter(currentTime: string): string {
        return `\n*Last updated on: ${currentTime}*`;
    }

    /**
     * 渲染完整的 README 内容
     */
    render(options: RenderOptions): string {
        const { githubData, currentTime } = options;

        let markdown = '';

        // 渲染抽象部分
        markdown += this.renderAbstract(options);

        // 渲染 Top 项目
        markdown += this.renderTopProjects(githubData.top_repos);

        // 渲染最近更新
        markdown += this.renderRecentUpdates(githubData.recent_repos);

        // 渲染页脚
        markdown += this.renderFooter(currentTime);

        return markdown;
    }

    /**
     * 生成项目统计信息
     */
    generateStats(githubData: any): string {
        const totalStars = githubData.top_repos.reduce((sum: number, repo: any) => sum + repo.star, 0);
        const totalForks = githubData.top_repos.reduce((sum: number, repo: any) => sum + (repo.score - repo.star), 0);

        return `
## 📊 Statistics
- **Total Repositories**: ${githubData.public_repos}
- **Top Projects Stars**: ${totalStars} ⭐
- **Total Forks**: ${totalForks} 🍴
- **Most Used Language**: ${this.getMostUsedLanguage(githubData.top_repos)}
`;
    }

    /**
     * 获取最常用语言
     */
    private getMostUsedLanguage(repos: ProcessedRepo[]): string {
        const languageCount: { [key: string]: number } = {};

        repos.forEach(repo => {
            if (repo.language) {
                languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
            }
        });

        const sortedLanguages = Object.entries(languageCount)
            .sort(([, a], [, b]) => b - a);

        return sortedLanguages.length > 0 ? sortedLanguages[0]?.[0] || 'Unknown' : 'Unknown';
    }
} 