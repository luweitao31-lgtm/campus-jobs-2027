# 2027 届央国企与外企校园招聘聚合站

每天从企业官网、官方招聘平台和可验证的官方公众号公开页面采集 2027 届正式校园招聘公告，生成可筛选的静态网站、JSON 和 CSV，并部署到 GitHub Pages：

<https://luweitao31-lgtm.github.io/campus-jobs-2027/>

## 收录规则

- 仅收录明确写有“2027届”或“27届”的校园招聘、秋招、春招和提前批。
- 不收录实习、薪酬报告、求职攻略、行业资讯或无法验证主体身份的转载。
- 主站只发布 sources.yaml 注册企业的官方域名链接；搜索结果只写入 data/leads.json，不公开。
- 当前注册 101 家企业：86 家央国企及国有金融机构、15 家重点外企；央企子公司可通过母公司官方渠道或国资委官网单独收录。
- 不绕过 robots.txt、验证码、登录墙或访问控制，也不收集求职者个人信息。

## 本地运行

需要 Python 3.10 或更高版本。

    python -m venv .venv
    .venv\Scripts\Activate.ps1
    python -m pip install -e ".[dev]"
    pytest
    campus-jobs full

也可以拆分运行：

    campus-jobs search     # 定向采集官方来源，并生成内部搜索线索
    campus-jobs recheck    # 复检已发布官方链接
    campus-jobs generate   # 重新生成 docs/index.html、JSON 和 CSV

## 数据与来源

- sources.yaml：企业、母公司、所有制、官方域名和采集入口。
- data/jobs.json：公开公告主数据，schema v2。
- data/leads.json：搜索发现、尚未核验的内部线索；该文件被 Git 忽略，自动任务仅将其保存为 14 天期维护者审计产物，不进入站点。
- data/health.json：最近一次官方来源采集健康状态。
- docs/：GitHub Pages 静态站点产物。

新增来源时必须配置官方域名和至少一个属于该域名的公开入口。企业注册表启动时会校验企业数量、名称唯一性、所有制类型和来源域名归属。

## 自动更新与 HTTPS

.github/workflows/daily.yml 每天 UTC 00:00（北京时间 08:00）执行测试、采集、复检、生成和部署。若可访问的官方来源比例低于配置阈值，任务会失败并保留上一版网站。GitHub Pages 自动提供 HTTPS，无需 SMTP 或其他密钥。

首次部署时，在仓库 Settings → Pages → Build and deployment 中选择 GitHub Actions，并在 Settings → Actions → General → Workflow permissions 中启用读写权限。

## 公开字段

每条公告包括企业、母公司、所有制类型、招聘批次、地点、发布日期、截止日期、来源类型、官方链接、首次发现时间、更新时间和有效状态。相同企业、招聘批次和官方链接会幂等更新，不重复发布。
