// ========== 全局数据结构 ==========

// 用户数据
let userData = {
    name: '新手冒险家',
    level: 1,
    totalXP: 0,
    records: [],
    achievements: []
};

// 成就定义
const achievements = [
    {
        id: 1,
        name: '初学者',
        description: '添加第一条成长记录',
        icon: '🔰',
        condition: () => userData.records.length >= 1,
        xpReward: 50,
        unlocked: false
    },
    {
        id: 2,
        name: '知识收集者',
        description: '添加10条学习记录',
        icon: '📚',
        condition: () => userData.records.filter(r => r.category === 'learning').length >= 10,
        xpReward: 200,
        unlocked: false
    },
    {
        id: 3,
        name: '编程高手',
        description: '添加15条编程记录',
        icon: '💻',
        condition: () => userData.records.filter(r => r.category === 'coding').length >= 15,
        xpReward: 300,
        unlocked: false
    },
    {
        id: 4,
        name: '健身达人',
        description: '添加20条运动记录',
        icon: '🏃',
        condition: () => userData.records.filter(r => r.category === 'sports').length >= 20,
        xpReward: 250,
        unlocked: false
    },
    {
        id: 5,
        name: '阅读爱好者',
        description: '添加10条阅读记录',
        icon: '📖',
        condition: () => userData.records.filter(r => r.category === 'reading').length >= 10,
        xpReward: 200,
        unlocked: false
    },
    {
        id: 6,
        name: '7天连续',
        description: '连续7天添加记录',
        icon: '🔥',
        condition: () => checkConsecutiveDays(7),
        xpReward: 300,
        unlocked: false
    },
    {
        id: 7,
        name: '记录大师',
        description: '添加50条成长记录',
        icon: '📝',
        condition: () => userData.records.length >= 50,
        xpReward: 500,
        unlocked: false
    },
    {
        id: 8,
        name: '学者',
        description: '达到等级5',
        icon: '🎓',
        condition: () => userData.level >= 5,
        xpReward: 500,
        unlocked: false
    },
    {
        id: 9,
        name: '传奇',
        description: '总经验值超过5000',
        icon: '🌟',
        condition: () => userData.totalXP >= 5000,
        xpReward: 1000,
        unlocked: false
    },
    {
        id: 10,
        name: '全能者',
        description: '五种分类各有15条记录',
        icon: '🏆',
        condition: () => {
            const categories = ['learning', 'coding', 'sports', 'reading', 'personal'];
            return categories.every(cat => userData.records.filter(r => r.category === cat).length >= 15);
        },
        xpReward: 800,
        unlocked: false
    }
];

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 从本地存储加载数据
    loadData();
    
    // 绑定事件
    bindEvents();
    
    // 初始化界面
    updateUI();
    renderAchievements();
});

// ========== 数据管理 ==========

function saveData() {
    localStorage.setItem('growthTrackerData', JSON.stringify({
        userData,
        achievements
    }));
}

function loadData() {
    const saved = localStorage.getItem('growthTrackerData');
    if (saved) {
        const data = JSON.parse(saved);
        userData = data.userData;
        achievements = data.achievements;
    }
}

// ========== 事件绑定 ==========

function bindEvents() {
    // 标签页切换
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            switchTab(tabName);
        });
    });

    // 添加记录表单
    document.getElementById('recordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addRecord();
    });

    // 设置今天的日期为默认值
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
}

// ========== 标签页切换 ==========

function switchTab(tabName) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 移除所有导航链接的active类
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // 显示选中的标签页
    document.getElementById(tabName).classList.add('active');

    // 标记选中的导航链接
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 更新统计页面
    if (tabName === 'stats') {
        updateStats();
    }
}

// ========== 记录管理 ==========

function addRecord() {
    const title = document.getElementById('recordTitle').value;
    const category = document.getElementById('recordCategory').value;
    const description = document.getElementById('recordDescription').value;
    const date = document.getElementById('recordDate').value;

    if (!title || !category || !date) {
        alert('请填写所有必填项');
        return;
    }

    // 创建记录对象
    const record = {
        id: Date.now(),
        title,
        category,
        description,
        date,
        xpGained: 10
    };

    // 添加到数据
    userData.records.push(record);
    userData.totalXP += 10;

    // 检查等级提升
    updateLevel();

    // 检查新解锁的成就
    checkAndUnlockAchievements();

    // 保存数据
    saveData();

    // 更新界面
    updateUI();

    // 清空表单
    document.getElementById('recordForm').reset();
    document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];

    // 提示成功
    alert('记录添加成功！');
}

function deleteRecord(recordId) {
    const index = userData.records.findIndex(r => r.id === recordId);
    if (index > -1) {
        const xpGained = userData.records[index].xpGained;
        userData.records.splice(index, 1);
        userData.totalXP -= xpGained;
        updateLevel();
        saveData();
        updateUI();
    }
}

// ========== 成就系统 ==========

function checkAndUnlockAchievements() {
    let newUnlocks = [];

    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            userData.totalXP += achievement.xpReward;
            newUnlocks.push(achievement);
        }
    });

    if (newUnlocks.length > 0) {
        // 显示每个新解锁的成就
        newUnlocks.forEach(achievement => {
            showAchievementPopup(achievement);
        });
    }

    return newUnlocks;
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievementPopup');
    document.getElementById('popupAchievementName').textContent = achievement.name;
    document.getElementById('popupAchievementDesc').textContent = achievement.description;
    document.getElementById('popupXP').textContent = achievement.xpReward;
    
    popup.classList.add('show');

    // 3秒后自动关闭
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

function closeAchievementPopup() {
    document.getElementById('achievementPopup').classList.remove('show');
}

function checkConsecutiveDays(days) {
    if (userData.records.length < days) return false;

    const sortedRecords = [...userData.records]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let consecutiveDays = 1;
    for (let i = 1; i < sortedRecords.length; i++) {
        const prevDate = new Date(sortedRecords[i - 1].date);
        const currDate = new Date(sortedRecords[i].date);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            consecutiveDays++;
            if (consecutiveDays >= days) return true;
        } else if (diffDays > 1) {
            consecutiveDays = 1;
        }
    }

    return false;
}

// ========== 等级系统 ==========

function updateLevel() {
    // 每100经验值升一级
    const newLevel = Math.floor(userData.totalXP / 100) + 1;
    if (newLevel > userData.level) {
        userData.level = newLevel;
    }
}

function getNextLevelXP() {
    return userData.level * 100;
}

function getCurrentLevelXP() {
    return userData.totalXP % 100;
}

// ========== UI更新 ==========

function updateUI() {
    updateDashboard();
    updateRecordsList();
}

function updateDashboard() {
    // 更新用户信息
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('totalXP').textContent = userData.totalXP;
    document.getElementById('achievementCount').textContent = 
        achievements.filter(a => a.unlocked).length;
    document.getElementById('recordCount').textContent = userData.records.length;

    // 更新经验值进度条
    const currentXP = getCurrentLevelXP();
    const nextLevelXP = 100;
    const percentage = (currentXP / nextLevelXP) * 100;
    
    document.getElementById('xpFill').style.width = percentage + '%';
    document.getElementById('currentXP').textContent = currentXP;
    document.getElementById('nextLevelXP').textContent = nextLevelXP;

    // 更新最近记录
    updateRecentRecords();

    // 更新即将解锁的成就
    updateUpcomingAchievements();
}

function updateRecentRecords() {
    const container = document.getElementById('recentRecords');
    const recent = userData.records.slice(-3).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-message">还没有记录呢，快添加一条吧！</p>';
        return;
    }

    container.innerHTML = recent.map(record => `
        <div class="record-item">
            <div class="record-title">${getCategoryEmoji(record.category)} ${record.title}</div>
            <div class="record-date">${record.date}</div>
            <small>+${record.xpGained} XP</small>
        </div>
    `).join('');
}

function updateUpcomingAchievements() {
    const container = document.getElementById('upcomingAchievements');
    const upcoming = achievements.filter(a => !a.unlocked).slice(0, 3);

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="empty-message">所有成就都已解锁！</p>';
        return;
    }

    container.innerHTML = upcoming.map(achievement => `
        <div class="achievement-item-small">
            <div style="font-size: 1.5rem;">${achievement.icon}</div>
            <div class="record-title">${achievement.name}</div>
            <div class="record-date">${achievement.description}</div>
            <small>+${achievement.xpReward} XP</small>
        </div>
    `).join('');
}

function updateRecordsList() {
    const container = document.getElementById('recordsList');

    if (userData.records.length === 0) {
        container.innerHTML = '<p class="empty-message">还没有任何记录</p>';
        return;
    }

    const sorted = [...userData.records].reverse();
    container.innerHTML = sorted.map(record => `
        <div class="record-card">
            <h4>${getCategoryEmoji(record.category)} ${record.title}</h4>
            <p>${record.description}</p>
            <div class="record-meta">
                <span>${record.date}</span>
                <span>+${record.xpGained} XP</span>
                <button class="btn btn-secondary" onclick="deleteRecord(${record.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function renderAchievements() {
    const container = document.getElementById('achievementsGrid');
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-progress">
                ${achievement.unlocked ? '✓ 已解锁' : '🔒 未解锁'}
            </div>
            ${!achievement.unlocked ? `
                <div class="achievement-locked-info">${achievement.description}</div>
            ` : `
                <div class="achievement-locked-info">+${achievement.xpReward} XP</div>
            `}
        </div>
    `).join('');
}

function updateStats() {
    // 按分类统计
    const stats = {
        learning: userData.records.filter(r => r.category === 'learning').length,
        coding: userData.records.filter(r => r.category === 'coding').length,
        sports: userData.records.filter(r => r.category === 'sports').length,
        reading: userData.records.filter(r => r.category === 'reading').length,
        personal: userData.records.filter(r => r.category === 'personal').length
    };

    document.getElementById('statLearning').textContent = stats.learning;
    document.getElementById('statCoding').textContent = stats.coding;
    document.getElementById('statSports').textContent = stats.sports;
    document.getElementById('statReading').textContent = stats.reading;
    document.getElementById('statPersonal').textContent = stats.personal;

    // 成就统计
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    document.getElementById('unlockedCount').textContent = unlockedCount;
    document.getElementById('totalAchievements').textContent = achievements.length;
    document.getElementById('totalXPStats').textContent = userData.totalXP;
}

// ========== 工具函数 ==========

function getCategoryEmoji(category) {
    const emojiMap = {
        learning: '📚',
        coding: '💻',
        sports: '🏃',
        reading: '📖',
        personal: '🎯'
    };
    return emojiMap[category] || '📝';
}

// ========== 页面加载完成后的初始化 ==========

// 首次进入时，检查是否有演示数据
window.addEventListener('load', () => {
    // 可选：添加一些演示数据用于测试
    if (userData.records.length === 0) {
        console.log('欢迎使用成长记录系统！开始添加你的第一条记录吧 🌱');
    }
});