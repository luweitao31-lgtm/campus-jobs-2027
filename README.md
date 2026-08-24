# 2027届校园招聘每日聚合器

每天通过无需密钥的 Google News RSS 公开搜索结果查找 2027 届校园招聘、提前批和明确可转正实习信息，核验企业官网投递入口，生成可筛选的 GitHub Pages 和 CSV，并通过 SMTP 发送新增摘要。

## 它如何判断一条信息

- 页面必须明确出现“2027届”或“27届”。
- 如果属于实习，还必须同时出现“转正”“留用”“Return Offer”等说明。
- 企业招聘域名和 `config.yaml` 中的可信 ATS 会标记为“官网已验证”。
- 牛客、应届生、高校就业网等是线索来源；找不到可证明归属的投递入口时，记录会标记为“待核验”。
- 404/410 链接标记为“已失效”并保留历史，不会直接删除。

## 本地运行

要求 Python 3.10 或更高版本。

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
campus-jobs full
```

也可以拆分运行：

```powershell
campus-jobs search     # 搜索、解析、去重并保存
campus-jobs recheck    # 复检已有投递链接
campus-jobs generate   # 重建 docs/index.html、JSON 和 CSV
campus-jobs mail       # 发送尚未通知的记录
pytest                 # 离线测试，不消耗 API 额度
```

主数据位于 `data/jobs.json`，生成的网站位于 `docs/`。修改 `config.yaml` 可以调整搜索词、来源、查询预算、抓取限制、企业域名和可信 ATS。新企业建议显式加入 `verification.company_domains`，避免把同名或转载页面误判为官网。

## GitHub 自动部署

1. 在 GitHub 新建仓库，将本项目推送到默认分支。
2. 打开 **Settings → Actions → General → Workflow permissions**，选择 **Read and write permissions**。
3. 打开 **Settings → Pages → Build and deployment**，将 Source 选择为 **GitHub Actions**。
4. 在 **Settings → Secrets and variables → Actions** 添加下列 Repository secrets：

   | Secret | 用途 |
   | --- | --- |
   | `SMTP_HOST` | SMTP 地址，例如 `smtp.qq.com` |
   | `SMTP_PORT` | STARTTLS 通常为 `587`；SSL 通常为 `465` |
   | `SMTP_USERNAME` | SMTP 登录账号 |
   | `SMTP_PASSWORD` | SMTP 授权码，不要使用网页登录密码 |
   | `MAIL_FROM` | 发件人地址 |
   | `MAIL_TO` | 收件人地址，多个地址用英文逗号分隔 |

5. 根据邮件服务修改 `config.yaml`：端口 465 通常设置 `use_ssl: true`、`use_tls: false`；端口 587 通常使用默认的 STARTTLS 配置。
6. 若希望邮件包含网站入口，在 `output.public_base_url` 填入 `https://<用户名>.github.io/<仓库名>/`。
7. 打开 **Actions → Daily campus jobs update → Run workflow** 做首次手动运行。

定时任务定义在 `.github/workflows/daily.yml`，使用 UTC `0 0 * * *`，对应北京时间每天 08:00。GitHub 可能有几分钟排队延迟。工作流通过并发锁避免两个更新任务同时写数据，成功后由机器人提交 `data/` 和 `docs/` 的变更，再部署 Pages。

## 常见 SMTP 配置

| 服务 | SMTP_HOST | 常用端口 | 备注 |
| --- | --- | --- | --- |
| QQ 邮箱 | `smtp.qq.com` | 465 | 开启 SMTP 后使用授权码；设 `use_ssl: true` |
| 163 邮箱 | `smtp.163.com` | 465 | 使用客户端授权码；设 `use_ssl: true` |
| Gmail | `smtp.gmail.com` | 587 | 使用应用专用密码；保持 STARTTLS |

邮件配置缺失或暂时发送失败不会破坏搜索结果和网页；记录只有在邮件成功发送后才会写入 `last_notified_at`，因此下次可以重试。全部 RSS 查询失败时则以非零状态退出，不发布可能不完整的新数据。

默认搜索方式不需要 API Key，也不会产生搜索服务费用。它依赖 Google News 的公开 RSS 搜索，因此覆盖率、排序和可用性可能随服务调整而变化；程序将查询频率限制为每天最多 20 个查询且每次间隔 2 秒。代码中仍保留 Bing RSS 备用实现；若以后需要商业 API，也可以将 `search.provider` 改为 `brave` 并配置 `BRAVE_API_KEY`。

## 数据字段与验证状态

每条记录包含企业、岗位、城市、岗位类别、招聘类型、发布时间、首次发现/更新时间、来源渠道、线索链接、官网链接、验证状态、有效状态、最后复检时间和最后通知时间。

验证状态：

- `verified_company`：企业招聘域名。
- `verified_ats`：配置中明确允许的官方招聘/ATS 域名。
- `unverified`：只有公开线索，尚未验证到官网入口。

有效状态：`active`、`expired` 或 `unknown`。403、登录墙和限流不会直接被当作岗位失效。

## 安全与合规

程序只读取公开网页并遵守 robots.txt，不绕过验证码、登录墙或访问控制。密钥只从环境变量读取，不会写入数据、网页或日志。第三方内容在网页和 HTML 邮件中都会转义；投递前仍应自行核对企业域名、岗位状态及隐私条款。
