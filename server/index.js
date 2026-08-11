import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- 配置 ----
const PORT = process.env.PORT || 3001;
const DOCS_ROOT = path.join(__dirname, '..', 'docs');
const VITEPRESS_DIST = path.join(DOCS_ROOT, '.vitepress', 'dist');
const ADMIN_DIR = path.join(DOCS_ROOT, 'admin');

// 自动检测是否为生产模式（存在 VitePress 构建产物）
const IS_PRODUCTION = fs.existsSync(path.join(VITEPRESS_DIST, 'index.html'));

// ---- 中间件 ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---- 生产模式：提供 VitePress 构建后的静态文件 ----
if (IS_PRODUCTION) {
    // 首页、文档页由 VitePress dist 提供
    app.use(express.static(VITEPRESS_DIST, {
        maxAge: '1d',
        immutable: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));

    // 同时将 public 目录挂到 /public 路由
    app.use(
        '/public',
        express.static(path.join(DOCS_ROOT, 'public'), { maxAge: '7d' })
    );

    console.log('[生产模式] VitePress 静态文件已挂载');
} else {
    console.log('[开发模式] 仅运行后台 API，VitePress 需单独启动 npm run docs:dev');
}

// ---- 后台管理页面 ----
app.use('/admin', express.static(ADMIN_DIR));

// ===================== API 路由 =====================

/**
 * 安全路径校验：防止目录遍历攻击
 */
function safePath(userPath) {
    const decoded = decodeURIComponent(userPath);
    const resolved = path.resolve(DOCS_ROOT, decoded);
    if (!resolved.startsWith(DOCS_ROOT)) return null;
    if (path.extname(resolved) !== '.md') return null;
    return resolved;
}

/**
 * 递归获取目录下所有 .md 文件
 */
function getAllMdFiles(dir, baseDir = DOCS_ROOT) {
    const results = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
            if (entry.isDirectory()) {
                const children = getAllMdFiles(fullPath, baseDir);
                if (children.length > 0) {
                    results.push({
                        name: entry.name,
                        type: 'directory',
                        relativePath: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
                        children,
                    });
                }
            } else if (entry.name.endsWith('.md')) {
                results.push({
                    name: entry.name.replace('.md', ''),
                    type: 'file',
                    relativePath: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
                });
            }
        }
    } catch (err) {
        console.error(`读取目录失败 ${dir}:`, err.message);
    }
    return results;
}

/** GET /api/files — 获取所有 Markdown 文件列表 */
app.get('/api/files', (_req, res) => {
    try {
        const files = getAllMdFiles(DOCS_ROOT);
        const filtered = files.filter((f) => f.name !== 'admin');
        res.json({ success: true, data: filtered });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/** GET /api/files/* — 读取单个 Markdown 文件 */
app.get('/api/files/*', (req, res) => {
    const filePath = req.params[0] || req.path.replace('/api/files/', '');
    if (!filePath) return res.status(400).json({ success: false, error: '缺少文件路径' });

    const safe = safePath(filePath);
    if (!safe) return res.status(403).json({ success: false, error: '不允许的路径' });

    try {
        const content = fs.readFileSync(safe, 'utf-8');
        const stats = fs.statSync(safe);
        res.json({
            success: true,
            data: {
                path: filePath,
                content,
                lastModified: stats.mtime.toISOString(),
            },
        });
    } catch {
        res.status(404).json({ success: false, error: '文件不存在' });
    }
});

/** POST /api/files/* — 保存 Markdown 文件 */
app.post('/api/files/*', (req, res) => {
    const filePath = req.params[0] || req.path.replace('/api/files/', '');
    if (!filePath) return res.status(400).json({ success: false, error: '缺少文件路径' });

    const { content } = req.body;
    if (typeof content !== 'string') return res.status(400).json({ success: false, error: '缺少内容' });

    const safe = safePath(filePath);
    if (!safe) return res.status(403).json({ success: false, error: '不允许的路径' });

    try {
        const dir = path.dirname(safe);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (fs.existsSync(safe)) {
            fs.copyFileSync(safe, safe + '.bak');
        }

        fs.writeFileSync(safe, content, 'utf-8');

        const backup = safe + '.bak';
        if (fs.existsSync(backup)) fs.unlinkSync(backup);

        res.json({ success: true, message: '保存成功' });
    } catch (err) {
        // 尝试从备份恢复
        const backup = safe + '.bak';
        if (fs.existsSync(backup)) {
            try { fs.copyFileSync(backup, safe); fs.unlinkSync(backup); } catch { /* 忽略 */ }
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// 生产模式：所有未匹配路由回退到 VitePress index.html（SPA fallback）
if (IS_PRODUCTION) {
    app.get('*', (req, res) => {
        // 只处理非 API 的非静态请求
        if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
        const indexPath = path.join(VITEPRESS_DIST, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Not Found');
        }
    });
}

// ---- 启动 ----
app.listen(PORT, '0.0.0.0', () => {
    if (IS_PRODUCTION) {
        console.log('');
        console.log('  📚 Alan的AI世界 - 生产模式');
        console.log(`  文档站:  http://localhost:${PORT}/`);
        console.log(`  后台管理: http://localhost:${PORT}/admin/`);
        console.log(`  API:     http://localhost:${PORT}/api/files`);
        console.log('');
    } else {
        console.log('');
        console.log('  📚 Alan的AI世界管理后台 - 开发模式');
        console.log(`  管理界面: http://localhost:${PORT}/admin/`);
        console.log('  提示: VitePress 需单独启动 → npm run docs:dev');
        console.log('');
    }
});
