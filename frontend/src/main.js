import './style.css';
import './app.css';
import { marked } from 'marked';

import { GetQuestion, UserSubmitAnswer } from '../wailsjs/go/main/App';

// 创建三层布局的HTML结构
document.querySelector('#app').innerHTML = `
    <div class="dialogue-container">
        <!-- 上层：显示JSON数据 -->
        <div class="json-display-section">
            <div class="header-section">
                <h5>AI询问：</h5>
                <label class="markdown-toggle">
                    <input type="checkbox" id="markdownToggle" onchange="toggleMarkdownMode()">
                    <span class="toggle-text">Markdown模式</span>
                </label>
            </div>
            <div class="json-content" id="jsonContent">
                等待 AI 询问...
            </div>
        </div>

        <!-- 中层：输入框和按钮 -->
        <div class="input-section">
            <textarea
                id="textInput"
                placeholder="请输入您的内容，按Enter键提交"
                rows="4"
            ></textarea>
            <div class="controls-row">
                <div class="shortcut-hint">快捷键：Ctrl+Enter</div>
                <label class="sound-toggle">
                    <input type="checkbox" id="soundToggle" onchange="toggleSound()">
                    <span class="toggle-text">🔊</span>
                </label>
                <button class="btn btn-primary" onclick="submitAnswer()">发送</button>
                <button class="btn btn-secondary" onclick="openPostscriptModal()">附言</button>
                <div class="active-postscripts" id="activePostscripts"></div>
            </div>
        </div>


    </div>

    <!-- 附言弹窗 -->
    <div class="modal-overlay" id="postscriptModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>附言管理</h3>
                <button class="modal-close" onclick="closePostscriptModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="postscript-list" id="postscriptList">
                    <!-- 附言项目将在这里动态生成 -->
                </div>
                <button class="btn btn-add" onclick="addPostscript()">增加一条附言</button>
            </div>
        </div>
    </div>
`;

let isMarkdownMode = false;
let currentQuestion = '';
let audioElement = null;

// 配置管理
const CONFIG_KEY = 'goask_settings';
const defaultConfig = {
    markdownMode: false,
    displaySectionHeight: 300,
    contentSectionHeight: 200,
    soundEnabled: true,
    postscripts: [
        {
            id: 1,
            visible: false,  // 是否在下方显示
            active: false,   // 是否传入输入框
            title: '详细解释',
            content: '请提供详细的解释和步骤说明。'
        },
        {
            id: 2,
            visible: false,
            active: false,
            title: '代码示例',
            content: '请提供相关的代码示例。'
        },
        {
            id: 3,
            visible: false,
            active: false,
            title: '注意事项',
            content: '请说明需要注意的事项和可能的问题。'
        }
    ]
};

// 加载配置
function loadConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY);
        if (saved) {
            const config = JSON.parse(saved);

            // 迁移旧的enabled字段到新的visible/active字段
            if (config.postscripts) {
                config.postscripts = config.postscripts.map(ps => {
                    if (ps.hasOwnProperty('enabled') && !ps.hasOwnProperty('visible')) {
                        return {
                            ...ps,
                            visible: ps.enabled,
                            active: ps.enabled,
                            enabled: undefined  // 移除旧字段
                        };
                    }
                    return ps;
                });
            }

            // 确保所有默认字段都存在
            return { ...defaultConfig, ...config };
        } else {
            // 首次使用，保存默认配置
            saveConfig(defaultConfig);
            return defaultConfig;
        }
    } catch (e) {
        console.warn('Failed to load config:', e);
        return defaultConfig;
    }
}

// 保存配置
function saveConfig(config) {
    try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save config:', e);
    }
}

// 应用配置
function applyConfig(config) {
    // 应用 Markdown 模式
    isMarkdownMode = config.markdownMode;
    const toggle = document.getElementById('markdownToggle');
    if (toggle) {
        toggle.checked = isMarkdownMode;
    }

    // 应用音效设置
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.checked = config.soundEnabled;
    }

    // 应用高度设置 - 确保在 DOM 加载后应用
    setTimeout(() => {
        const displaySection = document.querySelector('.json-display-section');
        if (displaySection && config.displaySectionHeight && config.displaySectionHeight !== 300) {
            displaySection.style.height = config.displaySectionHeight + 'px';
        }
    }, 0);

    updateDisplay();
}

// 示例 Markdown 内容
const exampleMarkdown = `# 示例 Markdown 内容

## 这是二级标题

**粗体文本** 和 *斜体文本* 以及 ~~删除线~~

### 任务列表
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

### 普通列表
- 列表项 1
- 列表项 2
- 列表项 3

### 有序列表
1. 有序列表 1
2. 有序列表 2
3. 有序列表 3

### 代码示例
\`代码片段\` 和代码块：

\`\`\`javascript
function hello() {
    console.log("Hello World!");
    return "marked.js 解析器";
}
\`\`\`

### 引用
> 这是引用文本
> 可以多行
> 支持 **粗体** 和 *斜体*

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

### 链接
[GitHub](https://github.com) | [Google](https://google.com)

---

等待 AI 询问...`;

// 配置 marked.js
marked.setOptions({
    breaks: true,        // 支持换行
    gfm: true,          // 启用 GitHub 风格 Markdown
    tables: true,       // 支持表格
    sanitize: false,    // 允许 HTML
    smartLists: true,   // 智能列表
    smartypants: false  // 禁用智能标点
});

// 页面加载完成后获取JSON数据
window.addEventListener('DOMContentLoaded', function () {
    // 初始化音频
    initAudio();

    // 加载并应用配置
    const config = loadConfig();
    applyConfig(config);

    // 设置高度变化监听
    setupResizeObserver();

    // Add Ctrl+Enter to submit
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('keydown', function (e) {
        // Ctrl+Enter to submit
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            submitAnswer();
        }
    });

    window.runtime.EventsOn("question", (question) => {
        currentQuestion = question;
        updateDisplay();
        // 播放通知音效
        playNotificationSound();
    });
    window.runtime.EventsOn("clear", () => {
        clearInputs();
    });
    loadQuestion();

    // 初始化显示示例内容（只在没有实际问题时显示）
    if (!currentQuestion) {
        currentQuestion = exampleMarkdown;
        updateDisplay();
    }

    // 初始化附言显示
    updateActivePostscripts();
});

// 切换 Markdown 模式
window.toggleMarkdownMode = function() {
    const toggle = document.getElementById('markdownToggle');
    isMarkdownMode = toggle.checked;

    // 保存配置
    const config = loadConfig();
    config.markdownMode = isMarkdownMode;
    saveConfig(config);

    updateDisplay();
};

// 附言管理
window.openPostscriptModal = function() {
    document.getElementById('postscriptModal').style.display = 'flex';
    renderPostscriptList();
};

window.closePostscriptModal = function() {
    document.getElementById('postscriptModal').style.display = 'none';
};

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('postscriptModal');
    if (e.target === modal) {
        closePostscriptModal();
    }
});

// ESC 键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('postscriptModal');
        if (modal.style.display !== 'none') {
            closePostscriptModal();
        }
    }
});

window.addPostscript = function() {
    const config = loadConfig();
    const newPostscript = {
        id: Date.now(),
        visible: false,
        active: false,
        title: '新附言',
        content: ''
    };
    config.postscripts.push(newPostscript);
    saveConfig(config);
    renderPostscriptList();
};

function renderPostscriptList() {
    const config = loadConfig();
    const listContainer = document.getElementById('postscriptList');

    listContainer.innerHTML = config.postscripts.map(ps => `
        <div class="postscript-item">
            <label class="postscript-toggle">
                <input type="checkbox" ${ps.visible ? 'checked' : ''}
                       onchange="togglePostscript(${ps.id})">
                <span>显示开关</span>
            </label>
            <input type="text" class="postscript-title" value="${ps.title}"
                   onchange="updatePostscriptTitle(${ps.id}, this.value)" placeholder="标题">
            <textarea class="postscript-content"
                      onchange="updatePostscriptContent(${ps.id}, this.value)"
                      placeholder="内容">${ps.content}</textarea>
            <button class="btn btn-delete" onclick="deletePostscript(${ps.id})">删除</button>
        </div>
    `).join('');
}

window.togglePostscript = function(id) {
    const config = loadConfig();
    const postscript = config.postscripts.find(ps => ps.id === id);
    if (postscript) {
        postscript.visible = !postscript.visible;
        // 显示开关不影响激活状态，只控制是否在界面显示
        // 激活状态由用户点击附言标签来控制
        saveConfig(config);
        updateActivePostscripts();
    }
};

window.updatePostscriptTitle = function(id, title) {
    const config = loadConfig();
    const postscript = config.postscripts.find(ps => ps.id === id);
    if (postscript) {
        postscript.title = title;
        saveConfig(config);
        updateActivePostscripts();
    }
};

window.updatePostscriptContent = function(id, content) {
    const config = loadConfig();
    const postscript = config.postscripts.find(ps => ps.id === id);
    if (postscript) {
        postscript.content = content;
        saveConfig(config);
    }
};

window.deletePostscript = function(id) {
    const config = loadConfig();
    config.postscripts = config.postscripts.filter(ps => ps.id !== id);
    saveConfig(config);
    renderPostscriptList();
    updateActivePostscripts();
};

// 单击切换附言激活状态
window.togglePostscriptActive = function(id) {
    // 直接更新 localStorage 中的特定附言状态，避免整体覆盖
    try {
        const config = loadConfig();
        const postscript = config.postscripts.find(ps => ps.id === id);
        if (postscript && postscript.visible) {
            postscript.active = !postscript.active;
            // 立即保存，减少竞态条件窗口
            saveConfig(config);
            updateActivePostscripts();
        }
    } catch (e) {
        console.warn('切换附言状态失败:', e);
    }
};

// 双击隐藏附言功能
window.disablePostscriptByDoubleClick = function(id) {
    const config = loadConfig();
    const postscript = config.postscripts.find(ps => ps.id === id);
    if (postscript && postscript.visible) {
        postscript.visible = false;
        postscript.active = false;  // 隐藏时同时设为不激活
        saveConfig(config);
        updateActivePostscripts();
        // 如果附言弹窗是打开的，也更新弹窗内容
        const modal = document.getElementById('postscriptModal');
        if (modal && modal.style.display !== 'none') {
            renderPostscriptList();
        }
    }
};

function updateActivePostscripts() {
    const config = loadConfig();
    const visiblePostscripts = config.postscripts.filter(ps => ps.visible);
    const container = document.getElementById('activePostscripts');

    container.innerHTML = visiblePostscripts.map(ps => {
        const activeClass = ps.active ? 'active-postscript-tag' : 'inactive-postscript-tag';
        const title = ps.active ? '单击切换为不传入，双击隐藏' : '单击切换为传入，双击隐藏';
        return `<span class="${activeClass}"
                      onclick="togglePostscriptActive(${ps.id})"
                      ondblclick="disablePostscriptByDoubleClick(${ps.id})"
                      title="${title}">${ps.title}</span>`;
    }).join('');
}

// 切换音效
window.toggleSound = function() {
    const soundToggle = document.getElementById('soundToggle');
    const soundEnabled = soundToggle.checked;

    // 保存配置
    const config = loadConfig();
    config.soundEnabled = soundEnabled;
    saveConfig(config);
};

// 初始化音频
function initAudio() {
    try {
        audioElement = new Audio('/deng.mp3');
        audioElement.volume = 0.5;
        audioElement.preload = 'auto';

        // 预加载音频（静默）
        audioElement.load();
    } catch (err) {
        console.warn('音频初始化失败:', err);
    }
}

// 播放音效
function playNotificationSound() {
    const config = loadConfig();
    if (config.soundEnabled && audioElement) {
        try {
            // 重置播放位置
            audioElement.currentTime = 0;
            audioElement.play().catch(err => {
                console.warn('音效播放失败:', err);
            });
        } catch (err) {
            console.warn('音效播放失败:', err);
        }
    }
}





// 设置高度变化监听
function setupResizeObserver() {
    const displaySection = document.querySelector('.json-display-section');
    if (!displaySection) return;

    // 使用 ResizeObserver 监听高度变化
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const height = entry.contentRect.height;
                if (height > 0) {
                    // 保存高度配置
                    const config = loadConfig();
                    config.displaySectionHeight = height;
                    saveConfig(config);
                }
            }
        });
        resizeObserver.observe(displaySection);
    } else {
        // 降级方案：使用 MutationObserver 监听 style 变化
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const height = displaySection.offsetHeight;
                    if (height > 0) {
                        const config = loadConfig();
                        config.displaySectionHeight = height;
                        saveConfig(config);
                    }
                }
            });
        });
        observer.observe(displaySection, { attributes: true, attributeFilter: ['style'] });
    }
}

// 更新显示内容
function updateDisplay() {
    const contentDiv = document.getElementById('jsonContent');

    if (isMarkdownMode && currentQuestion) {
        // Markdown 模式：使用 marked.js 解析并显示为 HTML
        contentDiv.innerHTML = marked.parse(currentQuestion);
    } else {
        // 原文模式：显示纯文本
        contentDiv.innerText = currentQuestion || '等待 AI 询问...';
    }
}



// 清空输入
function clearInputs() {
    const textInput = document.getElementById('textInput');
    textInput.value = '';
}







// 加载question
function loadQuestion() {
    GetQuestion().then(question => {
        if (question && question.trim()) {
            currentQuestion = question;
            updateDisplay();
        }
    }).catch(err => {
        console.error("获取问题失败:", err);
        // 不要覆盖当前显示的内容
    });
}



// 提交反馈
window.submitAnswer = function () {
    const textInput = document.getElementById('textInput');
    let text = textInput.value.trim();

    if (!text) {
        alert('输入为空！');
        return;
    }

    // 添加激活的附言内容（只有visible且active为true的才会传入）
    const config = loadConfig();
    const activePostscripts = config.postscripts.filter(ps => ps.visible && ps.active);
    if (activePostscripts.length > 0) {
        const postscriptTexts = activePostscripts.map(ps => ps.content).filter(content => content.trim());
        if (postscriptTexts.length > 0) {
            text += '\n\n' + postscriptTexts.join('\n\n');
        }
    }

    const userAnswer = {
        continue: true,
        text: text
    };

    UserSubmitAnswer(userAnswer).catch((err) => {
        console.error('提交反馈失败:', err);
    });
};


