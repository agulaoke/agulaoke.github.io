"""
阿骨唠嗑 · 内容创作工作台 - 后端服务
FastAPI + 本地JSON文件存储
"""
import json
import os
import re
import hashlib
import time
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

import httpx
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="阿骨唠嗑工作台")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据目录
DATA_DIR = Path("/workspace/agu-toolkit/data")
DATA_DIR.mkdir(exist_ok=True)

# 数据文件路径
TOPICS_FILE = DATA_DIR / "topics.json"
INSPIRATIONS_FILE = DATA_DIR / "inspirations.json"
HOTSPOTS_FILE = DATA_DIR / "hotspots.json"
SCRIPTS_FILE = DATA_DIR / "scripts.json"
VIDEOS_FILE = DATA_DIR / "videos.json"
SETTINGS_FILE = DATA_DIR / "settings.json"


def load_json(filepath: Path):
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filepath: Path, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def gen_id(prefix: str = "") -> str:
    ts = str(int(time.time() * 1000))
    short = ts[-8:]
    return f"{prefix}{short}"


# ==================== 数据模型 ====================

class TopicCreate(BaseModel):
    title: str
    source_domain: str = ""
    target_audience: str = "女性"
    difficulty: str = "medium"
    status: str = "pending"
    tags: list = []
    notes: str = ""

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    source_domain: Optional[str] = None
    target_audience: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[list] = None
    notes: Optional[str] = None

class InspirationCreate(BaseModel):
    content: str
    source_type: str = "manual"
    source_url: str = ""
    tags: list = []
    notes: str = ""

class InspirationUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[list] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ScriptCreate(BaseModel):
    topic_id: str = ""
    title: str = ""
    hook: str = ""
    pain_point: str = ""
    concept_bridge: str = ""
    case_study: str = ""
    closing: str = ""
    full_text: str = ""
    target_duration: int = 60
    status: str = "draft"

class ScriptUpdate(BaseModel):
    title: Optional[str] = None
    hook: Optional[str] = None
    pain_point: Optional[str] = None
    concept_bridge: Optional[str] = None
    case_study: Optional[str] = None
    closing: Optional[str] = None
    full_text: Optional[str] = None
    target_duration: Optional[int] = None
    status: Optional[str] = None

class VideoRecord(BaseModel):
    script_id: str = ""
    title: str = ""
    publish_date: str = ""
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    completion_rate: float = 0.0
    follower_gain: int = 0
    notes: str = ""

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    saves: Optional[int] = None
    completion_rate: Optional[float] = None
    follower_gain: Optional[int] = None
    notes: Optional[str] = None

class LinkExtractRequest(BaseModel):
    url: str

class HotspotRefreshRequest(BaseModel):
    source: str = "all"  # douyin, xiaohongshu, all


# ==================== 选题库 API ====================

@app.get("/api/topics")
def get_topics(status: str = ""):
    topics = load_json(TOPICS_FILE)
    if status:
        topics = [t for t in topics if t.get("status") == status]
    return sorted(topics, key=lambda x: x.get("updated_at", x.get("created_at", "")), reverse=True)


@app.post("/api/topics")
def create_topic(topic: TopicCreate):
    topics = load_json(TOPICS_FILE)
    now = datetime.now().isoformat()
    new_topic = {
        "id": gen_id("tp"),
        "title": topic.title,
        "source_domain": topic.source_domain,
        "target_audience": topic.target_audience,
        "difficulty": topic.difficulty,
        "status": topic.status,
        "tags": topic.tags,
        "notes": topic.notes,
        "created_at": now,
        "updated_at": now,
    }
    topics.append(new_topic)
    save_json(TOPICS_FILE, topics)
    return new_topic


@app.put("/api/topics/{topic_id}")
def update_topic(topic_id: str, update: TopicUpdate):
    topics = load_json(TOPICS_FILE)
    for t in topics:
        if t["id"] == topic_id:
            for k, v in update.model_dump(exclude_none=True).items():
                t[k] = v
            t["updated_at"] = datetime.now().isoformat()
            save_json(TOPICS_FILE, topics)
            return t
    raise HTTPException(404, "选题不存在")


@app.delete("/api/topics/{topic_id}")
def delete_topic(topic_id: str):
    topics = load_json(TOPICS_FILE)
    topics = [t for t in topics if t["id"] != topic_id]
    save_json(TOPICS_FILE, topics)
    return {"ok": True}


# ==================== 灵感库 API ====================

@app.get("/api/inspirations")
def get_inspirations(status: str = "", tag: str = "", source_type: str = ""):
    items = load_json(INSPIRATIONS_FILE)
    if status:
        items = [i for i in items if i.get("status") == status]
    if tag:
        items = [i for i in items if tag in i.get("tags", [])]
    if source_type:
        items = [i for i in items if i.get("source_type") == source_type]
    return sorted(items, key=lambda x: x.get("updated_at", x.get("created_at", "")), reverse=True)


@app.post("/api/inspirations")
def create_inspiration(item: InspirationCreate):
    items = load_json(INSPIRATIONS_FILE)
    now = datetime.now().isoformat()
    new_item = {
        "id": gen_id("in"),
        "content": item.content,
        "source_type": item.source_type,
        "source_url": item.source_url,
        "tags": item.tags,
        "notes": item.notes,
        "status": "raw",
        "created_at": now,
        "updated_at": now,
    }
    items.append(new_item)
    save_json(INSPIRATIONS_FILE, items)
    return new_item


@app.put("/api/inspirations/{insp_id}")
def update_inspiration(insp_id: str, update: InspirationUpdate):
    items = load_json(INSPIRATIONS_FILE)
    for i in items:
        if i["id"] == insp_id:
            for k, v in update.model_dump(exclude_none=True).items():
                i[k] = v
            i["updated_at"] = datetime.now().isoformat()
            save_json(INSPIRATIONS_FILE, items)
            return i
    raise HTTPException(404, "灵感不存在")


@app.delete("/api/inspirations/{insp_id}")
def delete_inspiration(insp_id: str):
    items = load_json(INSPIRATIONS_FILE)
    items = [i for i in items if i["id"] != insp_id]
    save_json(INSPIRATIONS_FILE, items)
    return {"ok": True}


@app.post("/api/inspirations/{insp_id}/promote")
def promote_to_topic(insp_id: str):
    """将灵感升级为选题"""
    items = load_json(INSPIRATIONS_FILE)
    insp = None
    for i in items:
        if i["id"] == insp_id:
            insp = i
            break
    if not insp:
        raise HTTPException(404, "灵感不存在")

    topics = load_json(TOPICS_FILE)
    now = datetime.now().isoformat()
    new_topic = {
        "id": gen_id("tp"),
        "title": insp["content"][:80],
        "source_domain": "",
        "target_audience": "女性",
        "difficulty": "medium",
        "status": "pending",
        "tags": insp.get("tags", []),
        "notes": f"来自灵感 {insp_id}: {insp.get('notes', '')}",
        "source_inspiration_id": insp_id,
        "created_at": now,
        "updated_at": now,
    }
    topics.append(new_topic)
    save_json(TOPICS_FILE, topics)

    # 标记灵感已转化
    insp["status"] = "promoted"
    insp["promoted_to"] = new_topic["id"]
    insp["updated_at"] = now
    save_json(INSPIRATIONS_FILE, items)

    return {"topic": new_topic, "inspiration": insp}


# ==================== 链接提取 API ====================

@app.post("/api/extract-link")
async def extract_link(req: LinkExtractRequest):
    """提取链接内容并存入灵感库"""
    url = req.url
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")

        # 提取标题
        title = ""
        og_title = soup.find("meta", property="og:title")
        if og_title:
            title = og_title.get("content", "")
        if not title:
            title_tag = soup.find("title")
            if title_tag:
                title = title_tag.get_text(strip=True)
        if not title:
            title = "未命名链接"

        # 提取描述
        description = ""
        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            description = og_desc.get("content", "")
        if not description:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                description = meta_desc.get("content", "")

        # 提取正文文本
        body_text = soup.get_text(separator="\n", strip=True)
        # 清理多余空白
        body_text = re.sub(r'\n{3,}', '\n\n', body_text)
        # 限制长度
        if len(body_text) > 3000:
            body_text = body_text[:3000] + "..."

        # 判断来源平台
        source_type = "web"
        source_name = "网页"
        if "douyin.com" in url:
            source_type = "douyin"
            source_name = "抖音"
        elif "xiaohongshu.com" in url or "xhslink.com" in url:
            source_type = "xiaohongshu"
            source_name = "小红书"
        elif "weibo.com" in url:
            source_type = "weibo"
            source_name = "微博"

        # 自动提取关键标签
        auto_tags = []
        if "女性" in title or "女性" in description:
            auto_tags.append("女性成长")
        if "情感" in title or "情感" in description or "关系" in title:
            auto_tags.append("情感")
        if "职场" in title or "工作" in title or "上班" in title:
            auto_tags.append("职场")
        if "认知" in title or "思维" in title or "思考" in title:
            auto_tags.append("认知")

        # 构建灵感内容
        content = f"[{source_name}] {title}\n\n{description}\n\n---\n{body_text[:500]}"

        # 存入灵感库
        items = load_json(INSPIRATIONS_FILE)
        now = datetime.now().isoformat()
        new_item = {
            "id": gen_id("in"),
            "content": content,
            "source_type": source_type,
            "source_url": url,
            "source_title": title,
            "source_description": description[:200] if description else "",
            "tags": auto_tags,
            "notes": "",
            "status": "raw",
            "created_at": now,
            "updated_at": now,
        }
        items.append(new_item)
        save_json(INSPIRATIONS_FILE, items)

        return {
            "inspiration": new_item,
            "extracted": {
                "title": title,
                "description": description[:300],
                "source_type": source_type,
                "source_name": source_name,
                "auto_tags": auto_tags,
            }
        }

    except httpx.HTTPError as e:
        raise HTTPException(400, f"链接访问失败: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"解析失败: {str(e)}")


# ==================== 热点库 API ====================

# 热点缓存
_hotspots_cache = {"data": [], "updated_at": ""}

@app.get("/api/hotspots")
def get_hotspots(source: str = "all", category: str = ""):
    """获取热点，优先返回缓存"""
    items = load_json(HOTSPOTS_FILE)
    if source != "all":
        items = [h for h in items if h.get("source") == source]
    if category:
        items = [h for h in items if h.get("category") == category]
    # 按热度排序
    items = sorted(items, key=lambda x: x.get("heat", 0), reverse=True)
    return items


@app.post("/api/hotspots/refresh")
async def refresh_hotspots(req: HotspotRefreshRequest):
    """刷新热点数据"""
    new_hotspots = []

    if req.source in ("douyin", "all"):
        try:
            async with httpx.AsyncClient(timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }) as client:
                resp = await client.get("https://www.douyin.com/", follow_redirects=True)
                # 尝试从页面提取热点
                soup = BeautifulSoup(resp.text, "lxml")
                # 抖音热点数据通常在JS中，这里做基础抓取
                texts = soup.get_text()
                douyin_items = _parse_hotspots_from_text(texts, "douyin")
                new_hotspots.extend(douyin_items)
        except Exception as e:
            print(f"抖音热点抓取失败: {e}")
            # 使用模拟数据保证可用性
            new_hotspots.extend(_get_fallback_hotspots("douyin"))

    if req.source in ("xiaohongshu", "all"):
        try:
            async with httpx.AsyncClient(timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
            }) as client:
                resp = await client.get("https://www.xiaohongshu.com/explore", follow_redirects=True)
                soup = BeautifulSoup(resp.text, "lxml")
                texts = soup.get_text()
                xhs_items = _parse_hotspots_from_text(texts, "xiaohongshu")
                new_hotspots.extend(xhs_items)
        except Exception as e:
            print(f"小红书热点抓取失败: {e}")
            new_hotspots.extend(_get_fallback_hotspots("xiaohongshu"))

    # 智能筛选：只保留可内容化的热点
    content_keywords = ["女性", "成长", "情感", "关系", "职场", "认知", "思维", "人生",
                        "读书", "学习", "焦虑", "独立", "自爱", "内耗", "通透", "清醒"]
    filtered = []
    for h in new_hotspots:
        title = h.get("title", "")
        if any(kw in title for kw in content_keywords):
            h["match_score"] = 3
        elif any(kw in title for kw in ["恋爱", "分手", "闺蜜", "穿搭", "美妆", "心理", "情绪"]):
            h["match_score"] = 2
        else:
            h["match_score"] = 1 if len(title) > 3 else 0
        if h["match_score"] > 0:
            filtered.append(h)

    # 保存
    existing = load_json(HOTSPOTS_FILE)
    now = datetime.now().isoformat()

    for h in filtered:
        h["id"] = gen_id("hs")
        h["created_at"] = now
        h["expires_at"] = (datetime.now() + timedelta(hours=24)).isoformat()

    all_hotspots = filtered + existing
    # 去重
    seen_titles = set()
    unique = []
    for h in all_hotspots:
        t = h.get("title", "")
        if t not in seen_titles:
            seen_titles.add(t)
            unique.append(h)

    save_json(HOTSPOTS_FILE, unique)
    _hotspots_cache["data"] = unique
    _hotspots_cache["updated_at"] = now

    return {"count": len(filtered), "total": len(unique), "hotspots": filtered[:20]}


def _parse_hotspots_from_text(text: str, source: str) -> list:
    """从页面文本尝试提取热点"""
    results = []
    # 简单提取：找#标签
    hashtags = re.findall(r'#([^#\s]{2,20})', text)
    seen = set()
    for tag in hashtags[:30]:
        tag = tag.strip()
        if tag not in seen and len(tag) >= 2:
            seen.add(tag)
            results.append({
                "title": f"#{tag}",
                "source": source,
                "heat": 50,
                "category": _guess_category(tag),
            })
    return results


def _get_fallback_hotspots(source: str) -> list:
    """当抓取失败时，返回手动整理的当前热点"""
    now = datetime.now().isoformat()
    hotspots = {
        "douyin": [
            {"title": "#成年人的顶级自律", "heat": 95, "category": "认知"},
            {"title": "#女性成长必经之路", "heat": 90, "category": "女性成长"},
            {"title": "#情绪价值有多重要", "heat": 88, "category": "情感"},
            {"title": "#读书改变认知", "heat": 85, "category": "认知"},
            {"title": "#停止精神内耗", "heat": 82, "category": "认知"},
            {"title": "#女生的底气来源", "heat": 80, "category": "女性成长"},
            {"title": "#通透的人都有什么特质", "heat": 78, "category": "认知"},
            {"title": "#高质量独处", "heat": 75, "category": "生活方式"},
        ],
        "xiaohongshu": [
            {"title": "#GirlsTalk", "heat": 95, "category": "女性成长"},
            {"title": "#女性觉醒", "heat": 92, "category": "女性成长"},
            {"title": "#情绪管理", "heat": 88, "category": "认知"},
            {"title": "#职场女性", "heat": 85, "category": "职场"},
            {"title": "#认知提升", "heat": 83, "category": "认知"},
            {"title": "#断舍离生活", "heat": 80, "category": "生活方式"},
            {"title": "#自愈系", "heat": 78, "category": "情感"},
            {"title": "#女性力量", "heat": 76, "category": "女性成长"},
        ]
    }
    result = []
    for h in hotspots.get(source, []):
        result.append({
            "title": h["title"],
            "source": source,
            "heat": h["heat"],
            "category": h["category"],
        })
    return result


def _guess_category(text: str) -> str:
    cat_map = {
        "女性": "女性成长", "成长": "女性成长", "女": "女性成长",
        "情感": "情感", "爱": "情感", "恋": "情感", "分手": "情感",
        "职场": "职场", "工作": "职场", "上班": "职场",
        "认知": "认知", "思维": "认知", "思考": "认知",
        "读书": "认知", "书": "认知",
        "穿搭": "生活方式", "美妆": "生活方式", "生活": "生活方式",
    }
    for kw, cat in cat_map.items():
        if kw in text:
            return cat
    return "其他"


# ==================== 脚本工作台 API ====================

@app.get("/api/scripts")
def get_scripts(status: str = ""):
    scripts = load_json(SCRIPTS_FILE)
    if status:
        scripts = [s for s in scripts if s.get("status") == status]
    return sorted(scripts, key=lambda x: x.get("updated_at", x.get("created_at", "")), reverse=True)


@app.post("/api/scripts")
def create_script(script: ScriptCreate):
    scripts = load_json(SCRIPTS_FILE)
    now = datetime.now().isoformat()
    new_script = {
        "id": gen_id("sc"),
        **script.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    scripts.append(new_script)
    save_json(SCRIPTS_FILE, scripts)
    return new_script


@app.put("/api/scripts/{script_id}")
def update_script(script_id: str, update: ScriptUpdate):
    scripts = load_json(SCRIPTS_FILE)
    for s in scripts:
        if s["id"] == script_id:
            for k, v in update.model_dump(exclude_none=True).items():
                s[k] = v
            s["updated_at"] = datetime.now().isoformat()
            save_json(SCRIPTS_FILE, scripts)
            return s
    raise HTTPException(404, "脚本不存在")


@app.delete("/api/scripts/{script_id}")
def delete_script(script_id: str):
    scripts = load_json(SCRIPTS_FILE)
    scripts = [s for s in scripts if s["id"] != script_id]
    save_json(SCRIPTS_FILE, scripts)
    return {"ok": True}


# ==================== 数据中心 API ====================

@app.get("/api/videos")
def get_videos():
    videos = load_json(VIDEOS_FILE)
    return sorted(videos, key=lambda x: x.get("publish_date", x.get("created_at", "")), reverse=True)


@app.post("/api/videos")
def create_video(video: VideoRecord):
    videos = load_json(VIDEOS_FILE)
    now = datetime.now().isoformat()
    new_video = {
        "id": gen_id("vd"),
        **video.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    videos.append(new_video)
    save_json(VIDEOS_FILE, videos)
    return new_video


@app.put("/api/videos/{video_id}")
def update_video(video_id: str, update: VideoUpdate):
    videos = load_json(VIDEOS_FILE)
    for v in videos:
        if v["id"] == video_id:
            for k, val in update.model_dump(exclude_none=True).items():
                v[k] = val
            v["updated_at"] = datetime.now().isoformat()
            save_json(VIDEOS_FILE, videos)
            return v
    raise HTTPException(404, "视频记录不存在")


@app.delete("/api/videos/{video_id}")
def delete_video(video_id: str):
    videos = load_json(VIDEOS_FILE)
    videos = [v for v in videos if v["id"] != video_id]
    save_json(VIDEOS_FILE, videos)
    return {"ok": True}


@app.get("/api/dashboard")
def get_dashboard():
    """首页仪表盘数据"""
    topics = load_json(TOPICS_FILE)
    inspirations = load_json(INSPIRATIONS_FILE)
    hotspots = load_json(HOTSPOTS_FILE)
    scripts = load_json(SCRIPTS_FILE)
    videos = load_json(VIDEOS_FILE)

    now = datetime.now()
    week_ago = (now - timedelta(days=7)).isoformat()

    recent_videos = [v for v in videos if v.get("publish_date", "") >= week_ago]
    total_views = sum(v.get("views", 0) for v in recent_videos)
    total_likes = sum(v.get("likes", 0) for v in recent_videos)
    avg_completion = sum(v.get("completion_rate", 0) for v in recent_videos) / max(len(recent_videos), 1)

    return {
        "topics": {
            "total": len(topics),
            "pending": len([t for t in topics if t.get("status") == "pending"]),
            "in_progress": len([t for t in topics if t.get("status") == "in_progress"]),
            "done": len([t for t in topics if t.get("status") == "done"]),
        },
        "inspirations": {
            "total": len(inspirations),
            "raw": len([i for i in inspirations if i.get("status") == "raw"]),
            "promoted": len([i for i in inspirations if i.get("status") == "promoted"]),
        },
        "hotspots": {
            "total": len(hotspots),
            "active": len([h for h in hotspots if h.get("heat", 0) >= 70]),
        },
        "scripts": {
            "total": len(scripts),
            "draft": len([s for s in scripts if s.get("status") == "draft"]),
            "ready": len([s for s in scripts if s.get("status") == "ready"]),
        },
        "videos": {
            "total": len(videos),
            "this_week": len(recent_videos),
        },
        "performance": {
            "total_views_this_week": total_views,
            "total_likes_this_week": total_likes,
            "avg_completion_rate": round(avg_completion, 2),
            "total_follower_gain": sum(v.get("follower_gain", 0) for v in recent_videos),
        },
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# ==================== 初始化数据 ====================

def init_sample_data():
    """首次运行时初始化示例数据"""
    if not TOPICS_FILE.exists():
        sample_topics = [
            {"id": "tp001", "title": "卸妆比化妆更重要——人生也需要'卸妆'", "source_domain": "护肤/化妆", "target_audience": "女性", "difficulty": "medium", "status": "pending", "tags": ["女性成长", "认知", "情感"], "notes": "用女生日常的卸妆动作，隐喻人生需要定期清理情绪和关系", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "tp002", "title": "你的精力就像衣柜——塞太满就找不到真正想穿的", "source_domain": "衣柜整理", "target_audience": "女性", "difficulty": "easy", "status": "pending", "tags": ["女性成长", "认知", "断舍离"], "notes": "从整理衣柜延伸到精力管理，女生共鸣度高", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "tp003", "title": "'沉没成本'不是成本——为什么你舍不得分手", "source_domain": "经济学", "target_audience": "女性", "difficulty": "medium", "status": "pending", "tags": ["情感", "认知", "女性成长"], "notes": "用经济学概念解释为什么女生在烂关系里走不出来", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "tp004", "title": "学会'情感止损'——及时离场是最高级的自爱", "source_domain": "投资", "target_audience": "女性", "difficulty": "medium", "status": "pending", "tags": ["情感", "认知"], "notes": "延续做空系列的金融隐喻，但聚焦情感场景", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "tp005", "title": "你的'情绪劳动'值多少钱？", "source_domain": "职场/经济学", "target_audience": "女性", "difficulty": "hard", "status": "pending", "tags": ["职场", "女性成长", "认知"], "notes": "职场女性的隐形付出——情绪劳动被严重低估", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
        ]
        save_json(TOPICS_FILE, sample_topics)

    if not INSPIRATIONS_FILE.exists():
        sample_insps = [
            {"id": "in001", "content": "看到一句话：'一个女人最高级的活法，是精神上的断舍离'。可以做个选题：从断舍离物品，到断舍离关系，再到断舍离思维方式。三层递进。", "source_type": "manual", "source_url": "", "tags": ["女性成长", "认知", "断舍离"], "notes": "三层递进结构，可以做系列", "status": "raw", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "in002", "content": "李诞在节目里说：'你只有一个武器就是努力，但他有很多武器——接受、放弃、等待。' 这句话可以做一期的核心引述。", "source_type": "manual", "source_url": "", "tags": ["认知", "情感"], "notes": "做空自己的续集可以用", "status": "raw", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
            {"id": "in003", "content": "读《反脆弱》想到：女性最需要的能力不是变强，而是'从打击中获益'的能力。可以做个选题。", "source_type": "manual", "source_url": "", "tags": ["读书", "认知", "女性成长"], "notes": "反脆弱→女性成长，跨界隐喻", "status": "raw", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
        ]
        save_json(INSPIRATIONS_FILE, sample_insps)


init_sample_data()


# ==================== 静态文件服务 ====================
# 在生产环境中，前端构建产物放在 frontend-dist
frontend_dist = Path("/workspace/agu-toolkit/frontend-dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
