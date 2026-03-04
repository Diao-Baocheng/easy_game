// 游戏状态 (Game State)
const state = {
    coins: 0,
    gems: 0,
    slime: {
        level: 1,
        exp: 0,
        maxExp: 100,
        type: 'normal',
        name: '果冻史莱姆'
    },
    stamina: {
        current: 10,
        max: 10,
        regenRate: 1000, // 毫秒/点
        lastRegenTime: Date.now()
    }
};

// 史莱姆变异种类 (概率学应用)
const slimeTypes = [
    { id: 'normal', name: '果冻史莱姆', weight: 60, coinMultiplier: 1 },
    { id: 'water', name: '水滴史莱姆', weight: 25, coinMultiplier: 1.5 },
    { id: 'fire', name: '烈焰史莱姆', weight: 10, coinMultiplier: 2.5 },
    { id: 'gold', name: '黄金史莱姆', weight: 5, coinMultiplier: 10 }
];

// DOM 元素引用
const els = {
    coins: document.getElementById('coins'),
    gems: document.getElementById('gems'),
    slime: document.getElementById('slime'),
    slimeName: document.getElementById('slime-name'),
    expText: document.getElementById('exp-text'),
    expFill: document.getElementById('exp-fill'),
    staminaText: document.getElementById('stamina-text'),
    staminaFill: document.getElementById('stamina-fill'),
    btnFeed: document.getElementById('btn-feed'),
    btnAdStamina: document.getElementById('btn-ad-stamina'),
    log: document.getElementById('log')
};

// --- 核心逻辑 (循环与概率) ---

// 1. 行为：投喂 (Input)
function feed() {
    if (state.stamina.current < 1) {
        addLog("体力不足！", "system");
        return;
    }

    // 消耗体力
    state.stamina.current -= 1;
    
    // 视觉反馈
    els.slime.classList.add('clicked');
    setTimeout(() => els.slime.classList.remove('clicked'), 100);

    // 基础收益
    const baseExp = 15;
    const currentMultiplier = slimeTypes.find(t => t.id === state.slime.type).coinMultiplier;
    let earnedCoins = Math.floor((Math.random() * 5 + 5) * currentMultiplier * state.slime.level);
    
    // 概率事件：暴击掉落钻石 (10% 概率)
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
        state.gems += 1;
        addLog(`✨ 暴击！史莱姆吐出了一颗钻石！`, "critical");
    }

    // 更新状态
    state.coins += earnedCoins;
    gainExp(baseExp);
    
    addLog(`喂食成功，获得 ${earnedCoins} 🪙`, "normal");
    updateUI();
}

// 2. 逻辑：经验与升级
function gainExp(amount) {
    state.slime.exp += amount;
    if (state.slime.exp >= state.slime.maxExp) {
        levelUp();
    }
}

// 3. 概率学应用：升级与变异
function levelUp() {
    state.slime.level += 1;
    state.slime.exp -= state.slime.maxExp;
    state.slime.maxExp = Math.floor(state.slime.maxExp * 1.5); // 数值膨胀
    
    // 满血复活
    state.stamina.max += 2;
    state.stamina.current = state.stamina.max;

    addLog(`🎉 升级了！当前等级 Lv.${state.slime.level}`, "rare");

    // 变异概率判定 (根据权重随机)
    if (state.slime.level % 3 === 0) {
        mutate();
    }
}

function mutate() {
    const totalWeight = slimeTypes.reduce((sum, type) => sum + type.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    let newType = slimeTypes[0];
    for (const type of slimeTypes) {
        if (randomNum < type.weight) {
            newType = type;
            break;
        }
        randomNum -= type.weight;
    }

    if (newType.id !== state.slime.type) {
        state.slime.type = newType.id;
        state.slime.name = newType.name;
        addLog(`🧬 基因突变！史莱姆进化成了 ${newType.name}!`, "rare");
    }
}

// 4. 商业化挂钩：看广告恢复体力
function watchAdForStamina() {
    addLog(`📺 正在播放广告...`, "system");
    els.btnAdStamina.disabled = true;
    els.btnAdStamina.textContent = "广告播放中...";
    
    // 模拟广告播放 (3秒)
    setTimeout(() => {
        state.stamina.current = state.stamina.max;
        addLog(`🎁 广告观看完毕！体力已回满！`, "rare");
        els.btnAdStamina.disabled = false;
        els.btnAdStamina.textContent = "📺 看广告回满体力";
        updateUI();
    }, 3000);
}

// 5. 游戏引擎循环 (Game Loop) - 处理自然恢复
function gameLoop() {
    const now = Date.now();
    // 每 1000ms 恢复 1 点体力 (如果不足最大值)
    if (now - state.stamina.lastRegenTime >= state.stamina.regenRate) {
        if (state.stamina.current < state.stamina.max) {
            state.stamina.current += 1;
            updateUI();
        }
        state.stamina.lastRegenTime = now;
    }
    
    requestAnimationFrame(gameLoop);
}

// --- 渲染逻辑 (UI Update) ---
function updateUI() {
    els.coins.textContent = state.coins;
    els.gems.textContent = state.gems;
    
    els.slimeName.textContent = `${state.slime.name} (Lv.${state.slime.level})`;
    
    // 更新史莱姆外观样式
    els.slime.className = `slime ${state.slime.type}`;
    
    els.expText.textContent = `${state.slime.exp} / ${state.slime.maxExp}`;
    els.expFill.style.width = `${(state.slime.exp / state.slime.maxExp) * 100}%`;
    
    els.staminaText.textContent = `${state.stamina.current} / ${state.stamina.max}`;
    els.staminaFill.style.width = `${(state.stamina.current / state.stamina.max) * 100}%`;
    
    els.btnFeed.disabled = state.stamina.current < 1;
}

function addLog(text, type = "normal") {
    const logEl = document.createElement('div');
    logEl.className = `log-item ${type}`;
    logEl.textContent = text;
    els.log.insertBefore(logEl, els.log.firstChild);
    
    // 保持日志数量不过多
    if (els.log.children.length > 20) {
        els.log.removeChild(els.log.lastChild);
    }
}

// --- 事件绑定 ---
els.btnFeed.addEventListener('click', feed);
els.btnAdStamina.addEventListener('click', watchAdForStamina);

// --- 初始化 ---
updateUI();
gameLoop();
