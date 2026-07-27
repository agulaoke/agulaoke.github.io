import { create } from 'zustand'

// 本地存储工具函数
const DB_NAME = 'agu-toolkit'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('topics')) db.createObjectStore('topics', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('inspirations')) db.createObjectStore('inspirations', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('hotspots')) db.createObjectStore('hotspots', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('scripts')) db.createObjectStore('scripts', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getAll(storeName) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => resolve([])
  })
}

async function put(storeName, item) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.put(item)
    tx.oncomplete = () => resolve()
  })
}

async function remove(storeName, id) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.delete(id)
    tx.oncomplete = () => resolve()
  })
}

function genId(prefix = '') {
  const ts = Date.now().toString()
  return `${prefix}${ts.slice(-8)}`
}

// 示例数据
const SAMPLE_TOPICS = [
  { id: 'tp001', title: "卸妆比化妆更重要——人生也需要'卸妆'", source_domain: '护肤/化妆', target_audience: '女性', difficulty: 'medium', status: 'pending', tags: ['女性成长', '认知', '情感'], notes: '用女生日常的卸妆动作，隐喻人生需要定期清理情绪和关系', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tp002', title: "你的精力就像衣柜——塞太满就找不到真正想穿的", source_domain: '衣柜整理', target_audience: '女性', difficulty: 'easy', status: 'pending', tags: ['女性成长', '认知', '断舍离'], notes: '从整理衣柜延伸到精力管理，女生共鸣度高', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tp003', title: "'沉没成本'不是成本——为什么你舍不得分手", source_domain: '经济学', target_audience: '女性', difficulty: 'medium', status: 'pending', tags: ['情感', '认知', '女性成长'], notes: '用经济学概念解释为什么女生在烂关系里走不出来', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tp004', title: "学会'情感止损'——及时离场是最高级的自爱", source_domain: '投资', target_audience: '女性', difficulty: 'medium', status: 'pending', tags: ['情感', '认知'], notes: '延续做空系列的金融隐喻，但聚焦情感场景', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tp005', title: "你的'情绪劳动'值多少钱？", source_domain: '职场/经济学', target_audience: '女性', difficulty: 'hard', status: 'pending', tags: ['职场', '女性成长', '认知'], notes: '职场女性的隐形付出——情绪劳动被严重低估', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const SAMPLE_INSPIRATIONS = [
  { id: 'in001', content: "看到一句话：'一个女人最高级的活法，是精神上的断舍离'。可以做个选题：从断舍离物品，到断舍离关系，再到断舍离思维方式。三层递进。", source_type: 'manual', source_url: '', tags: ['女性成长', '认知', '断舍离'], notes: '三层递进结构，可以做系列', status: 'raw', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'in002', content: "李诞在节目里说：'你只有一个武器就是努力，但他有很多武器——接受、放弃、等待。' 这句话可以做一期的核心引述。", source_type: 'manual', source_url: '', tags: ['认知', '情感'], notes: '做空自己的续集可以用', status: 'raw', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const SAMPLE_SCRIPTS = [
  {
    id: 'sc001',
    title: '看了《新闻女王》才发现，成年人的世界全是灰色',
    hook: '有这么一个女人——香港最大电视台的金牌主播，文慧心。十年前凭一宗贼王案报道一战成名，整个台里没人不服她。但她最信任的徒弟徐晓薇，背地里做了一件事——把她的信息，卖给了她的死对头。',
    pain_point: '你仔细想想：为什么你对人越好，别人越不珍惜？为什么你能力最强，升职的反而是那个会站队的？为什么那些看起来窝囊的人，最后却活到了最后？因为你不是不懂规则——你是不想承认规则。',
    concept_bridge: '这部剧里三个主角，代表了三种交换方式。文慧心用能力和控制换权力——代价是身边没有一个真心对她的人。梁景仁用人脉和手段换资源——代价是所有人都在防着他。徐晓薇用听话和背叛换生存——代价是把自己搞到精神崩溃。没有谁更高尚。只有你拿什么换，和你能不能承受这个代价。',
    case_study: '文慧心，香港最大电视台的金牌主播。她的规则很简单：我给你资源，你回报我忠诚。但她最信任的徒弟徐晓薇，背地里把她的情报卖给了死对头。文慧心知道后没有暴怒——她只是记住了。因为她的逻辑是：我跟你签的是长期契约。你背叛我，代价迟早要付��而她的对手梁景仁，完全是另一套逻辑——不问忠诚，只问有用。你今天能给他拉赞助，你就是他的人；明天给不了，门在那边。徐晓薇就在这两个人之间游走——对文慧心打听话牌，对梁景仁打背叛牌。她不是忠于谁，她只是谁的出价高就跟谁。最后呢？她目睹妹妹意外死亡，确诊抑郁症，选择离职。她付出了尊严、忠诚、心理健康——换来的不过是从这个系统里活着离开。',
    closing: '看完这部剧我在想：我们每个人的生活里，是不是也在做同样的交换？用委屈换关系？用加班换安全感？用沉默换懂事？用讨好换被需要？你今天在拿什么换什么——你甘心吗？评论区聊聊。',
    full_text: '【0-10秒｜黄金钩子】\n你有没有发现——身边混得最好的人，往往不是最善良的那个？我最近看了一部剧，看完后背发凉。因为它告诉我一个真相：成年人的世界里，所有人都在交换。区别只是，你拿什么换。\n\n【10-25秒｜痛点场景】\n你仔细想想：为什么你对人越好，别人越不珍惜？为什么你能力最强，升职的反而是那个会站队的？为什么那些看起来窝囊的人，最后却活到了最后？因为你不是不懂规则——你是不想承认规则。\n\n【25-45秒｜文慧心的规则】\n这部剧叫《新闻女王》。女主文慧心，香港最大电视台的金牌主播，十年前凭一宗贼王案报道一战成名。她的规则很简单：我给你资源、给你曝光、给你上位的机会，你回报我忠诚和服从。她最信任的徒弟徐晓薇，出身很差——单亲家庭，母亲靠拾荒为生。文慧心帮她伪造了斯坦福学历，把她包装成海归高材生，一手捧上黄金时段。但她后来发现，徐晓薇背地里把她的情报卖给了死对头梁景仁。文慧心知道后没有暴怒，没有摊牌——她只是记住了。因为她的逻辑是：我跟你签的是长期契约。你背叛我，代价迟早要付。我不急。\n\n【45-70秒｜梁景仁的规则】\n她的对手梁景仁，完全不是这套逻辑。他不跟你签什么长期契约。他的规则只有一条：你今天有没有用？你能帮他拉到赞助、抢到独家，你就是他的人；明天你给不了，对不起，门在那边。徐晓薇在他眼里也一样——不是喜欢，不是信任，是你今天能给我文慧心的情报，我就给你上位的梯子。他就是靠这套玩法，从报道英国脱欧一战成名后，转而在炒新闻、拉关系的路上越走越远。整部剧就是这两个人斗来斗去。但你越看越发现——你恨不了任何一个人。文慧心狠？她要的不过是一份忠诚。梁景仁虚伪？他要的不过是一份有用。规则不同而已。\n\n【70-100秒｜徐晓薇的悲剧】\n徐晓薇就在这两个人之间游走。对文慧心打听话牌，对梁景仁打背叛牌——她不是忠于谁，她只是谁的出价高就跟谁。但她的筹码太少了：能力一般、学历是假的、靠山也随时可能抛弃她。她除了听话和背叛，根本没有别的牌可以打。她的结局是什么？在职场争斗中目睹妹妹意外死亡，开始出现幻听、幻视，确诊抑郁症。最后选择离职。我看到这里，心里堵得慌。她付出了她能付出的一切——尊严、忠诚、心理健康——换来的，不过是从这个系统里活着离开。\n\n【100-130秒｜概念嫁接——三种交换】\n以前我以为成年人世界是黑白的：好人就是好人，坏人就是坏人。看完这部剧我才懂——每个人都在做交换。文慧心用能力和控制换权力——代价是身边没有一个真心对她的人。梁景仁用人脉和手段换资源——代价是所有人都在防着他。徐晓薇用听话和背叛换生存——代价是把自己搞到精神崩溃。没有谁更高尚。只有你拿什么换，和你能不能承受这个代价。\n\n【130-155秒｜三个如果是我】\n看到这里我就在想：如果我是文慧心——我有能力，但我能不能承受身边全是算计我的人？如果我是梁景仁——我八面玲珑，但我能接受自己没有底线吗？如果我是徐晓薇——我筹码太少，只能靠听话和背叛活下来，但代价是把自己搞到精神崩溃。这部剧最狠的地方就在这——它不给你正确答案。它只是把三种活法摊在你面前，让你自己看：哪一种代价你付得起。\n\n【155-175秒｜收尾——拉回观众】\n这也是为什么我把这部剧看了两遍。第一遍看的是剧情——谁赢了谁输了。第二遍看的才是自己——我们每个人的生活里，是不是也在做同样的交换？用委屈换关系？用加班换安全感？用沉默换懂事？用讨好换被需要？你今天在拿什么换什么——你甘心吗？评论区聊聊。\n\n【175-185秒｜最后金句】\n成年人的世界没有绝对的黑白，只有一道灰色的光——照出了每个人的代价。也照出了，你自己。OK，今天就聊到这。下次见。',
    target_duration: 180,
    status: 'ready',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

export const useStore = create((set, get) => ({
  topics: [],
  inspirations: [],
  hotspots: [],
  scripts: [],
  videos: [],
  dashboard: null,
  toast: null,
  initialized: false,

  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 2500)
  },

  // 初始化：加载本地数据，首次使用写入示例
  loadAll: async () => {
    const s = get()
    if (s.initialized) return

    let topics = await getAll('topics')
    let inspirations = await getAll('inspirations')
    let hotspots = await getAll('hotspots')
    let scripts = await getAll('scripts')
    let videos = await getAll('videos')

    // 首次使用：写入示例数据
    if (topics.length === 0 && scripts.length === 0) {
      for (const t of SAMPLE_TOPICS) await put('topics', t)
      for (const i of SAMPLE_INSPIRATIONS) await put('inspirations', i)
      for (const sc of SAMPLE_SCRIPTS) await put('scripts', sc)
      topics = SAMPLE_TOPICS
      inspirations = SAMPLE_INSPIRATIONS
      scripts = SAMPLE_SCRIPTS
    }

    set({
      topics, inspirations, hotspots, scripts, videos,
      dashboard: {
        topics: { total: topics.length, pending: topics.filter(t => t.status === 'pending').length, in_progress: topics.filter(t => t.status === 'in_progress').length, done: topics.filter(t => t.status === 'done').length },
        inspirations: { total: inspirations.length, raw: inspirations.filter(i => i.status === 'raw').length, promoted: inspirations.filter(i => i.status === 'promoted').length },
        hotspots: { total: hotspots.length, active: hotspots.filter(h => h.heat >= 70).length },
        scripts: { total: scripts.length, draft: scripts.filter(s => s.status === 'draft').length, ready: scripts.filter(s => s.status === 'ready').length },
        videos: { total: videos.length, this_week: 0 },
        performance: { total_views_this_week: 0, total_likes_this_week: 0, avg_completion_rate: 0, total_follower_gain: 0 },
      },
      initialized: true,
    })
  },

  // === 选题 ===
  addTopic: async (data) => {
    const topic = { id: genId('tp'), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    await put('topics', topic)
    set((s) => ({ topics: [topic, ...s.topics] }))
    get().showToast('选题已添加 ✅')
  },

  updateTopic: async (id, data) => {
    const existing = get().topics.find(t => t.id === id)
    if (!existing) return
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await put('topics', updated)
    set((s) => ({ topics: s.topics.map(t => t.id === id ? updated : t) }))
    get().showToast('已更新 ✅')
  },

  deleteTopic: async (id) => {
    await remove('topics', id)
    set((s) => ({ topics: s.topics.filter(t => t.id !== id) }))
    get().showToast('已删除')
  },

  // === 灵感 ===
  addInspiration: async (data) => {
    const item = { id: genId('in'), ...data, status: data.status || 'raw', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    await put('inspirations', item)
    set((s) => ({ inspirations: [item, ...s.inspirations] }))
    get().showToast('灵感已保存 ✨')
  },

  updateInspiration: async (id, data) => {
    const existing = get().inspirations.find(i => i.id === id)
    if (!existing) return
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await put('inspirations', updated)
    set((s) => ({ inspirations: s.inspirations.map(i => i.id === id ? updated : i) }))
    get().showToast('已更新 ✅')
  },

  deleteInspiration: async (id) => {
    await remove('inspirations', id)
    set((s) => ({ inspirations: s.inspirations.filter(i => i.id !== id) }))
    get().showToast('已删除')
  },

  promoteInspiration: async (id) => {
    const insp = get().inspirations.find(i => i.id === id)
    if (!insp) return
    const topic = {
      id: genId('tp'),
      title: insp.content.slice(0, 80),
      source_domain: '',
      target_audience: '女性',
      difficulty: 'medium',
      status: 'pending',
      tags: insp.tags || [],
      notes: `来自灵感: ${insp.notes || ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await put('topics', topic)
    const updatedInsp = { ...insp, status: 'promoted', promoted_to: topic.id, updated_at: new Date().toISOString() }
    await put('inspirations', updatedInsp)
    set((s) => ({
      topics: [topic, ...s.topics],
      inspirations: s.inspirations.map(i => i.id === id ? updatedInsp : i),
    }))
    get().showToast('已升级为选题 🚀')
  },

  // 链接投喂（纯前端版：只记录URL，不能自动提取）
  extractLink: async (url) => {
    const source_type = url.includes('douyin.com') ? 'douyin' : url.includes('xiaohongshu.com') ? 'xiaohongshu' : 'web'
    const source_name = source_type === 'douyin' ? '抖音' : source_type === 'xiaohongshu' ? '小红书' : '网页'
    const item = {
      id: genId('in'),
      content: `[${source_name}] ${url}`,
      source_type,
      source_url: url,
      tags: [],
      notes: '请手动补充内容摘要',
      status: 'raw',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await put('inspirations', item)
    set((s) => ({ inspirations: [item, ...s.inspirations] }))
    get().showToast(`链接已保存 📎 (${source_name})，请手动补充内容`)
  },

  // 热点（纯前端版：使用预设热点数据）
  refreshHotspots: async () => {
    const now = new Date().toISOString()
    const fallback = [
      { id: 'hs001', title: '#成年人的顶级自律', source: 'douyin', heat: 95, category: '认知', match_score: 3, created_at: now },
      { id: 'hs002', title: '#女性成长必经之路', source: 'douyin', heat: 90, category: '女性成长', match_score: 3, created_at: now },
      { id: 'hs003', title: '#情绪价值有多重要', source: 'douyin', heat: 88, category: '情感', match_score: 3, created_at: now },
      { id: 'hs004', title: '#读书改变认知', source: 'douyin', heat: 85, category: '认知', match_score: 3, created_at: now },
      { id: 'hs005', title: '#停止精神内耗', source: 'douyin', heat: 82, category: '认知', match_score: 3, created_at: now },
      { id: 'hs006', title: '#GirlsTalk', source: 'xiaohongshu', heat: 95, category: '女性成长', match_score: 3, created_at: now },
      { id: 'hs007', title: '#女性觉醒', source: 'xiaohongshu', heat: 92, category: '女性成长', match_score: 3, created_at: now },
      { id: 'hs008', title: '#情绪管理', source: 'xiaohongshu', heat: 88, category: '认知', match_score: 3, created_at: now },
      { id: 'hs009', title: '#职场女性', source: 'xiaohongshu', heat: 85, category: '职场', match_score: 3, created_at: now },
      { id: 'hs010', title: '#认知提升', source: 'xiaohongshu', heat: 83, category: '认知', match_score: 3, created_at: now },
    ]
    for (const h of fallback) await put('hotspots', h)
    set({ hotspots: fallback })
    get().showToast(`热点已刷新 🔥 (${fallback.length}条)`)
  },

  // === 脚本 ===
  addScript: async (data) => {
    const script = { id: genId('sc'), ...data, status: data.status || 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    await put('scripts', script)
    set((s) => ({ scripts: [script, ...s.scripts] }))
    get().showToast('脚本已保存 📝')
  },

  updateScript: async (id, data) => {
    const existing = get().scripts.find(s => s.id === id)
    if (!existing) return
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await put('scripts', updated)
    set((s) => ({ scripts: s.scripts.map(sc => sc.id === id ? updated : sc) }))
    get().showToast('已更新 ✅')
  },

  deleteScript: async (id) => {
    await remove('scripts', id)
    set((s) => ({ scripts: s.scripts.filter(sc => sc.id !== id) }))
    get().showToast('已删除')
  },

  // === 视频数据 ===
  addVideo: async (data) => {
    const video = { id: genId('vd'), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    await put('videos', video)
    set((s) => ({ videos: [video, ...s.videos] }))
    get().showToast('数据已记录 📊')
  },

  updateVideo: async (id, data) => {
    const existing = get().videos.find(v => v.id === id)
    if (!existing) return
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await put('videos', updated)
    set((s) => ({ videos: s.videos.map(v => v.id === id ? updated : v) }))
    get().showToast('已更新 ✅')
  },

  deleteVideo: async (id) => {
    await remove('videos', id)
    set((s) => ({ videos: s.videos.filter(v => v.id !== id) }))
    get().showToast('已删除')
  },
}))
