// Display translations only. Persisted enum values and user-authored text stay unchanged.
const entries = `
Aesthetic Sample Analyzer=审美样本分析
Missing image.=缺少图片。
Expected an image data URL.=图片数据格式错误。
Image is too large to analyze. Try a smaller file.=图片过大，请使用较小的文件。
Image is still too large to analyze.=图片压缩后仍过大，无法分析。
Could not read image=无法读取图片。
Could not read an imported image.=无法读取导入的图片。
Could not read this image.=无法读取这张图片。
Could not encode this image.=无法转换这张图片。
Could not open the local library.=无法打开本地样本库。
Could not read the library.=无法读取样本库。
Could not save this sample.=无法保存这张样本。
Could not delete this sample.=无法删除这张样本。
The model returned an unreadable analysis.=模型返回的分析无法解析。
Sections=功能导航
needs 3+ analyzed on each side=两组各需至少 3 份分析
anecdotal under 4=不足 4 份，仅为个别线索
likes only, absent from most of the library=仅见于喜欢组，全库中较少见
Could not save.=无法保存，请检查浏览器存储空间。
No images in that drop.=没有可导入的图片。
Sample deleted.=样本已删除。
Could not delete.=删除失败。
Reading visible traits…=正在识别可见特征…
Analysis failed.=分析失败。
Every sample already has an analysis.=所有样本都已有分析。
Stopping after the current image…=当前图片分析完成后停止…
That file is not valid JSON.=该文件不是有效的 JSON。
That file is not an analyzer library.=该文件不是本应用的样本库。
Unsupported library format. Nothing imported.=不支持的样本库格式，未导入任何内容。
Nothing new to import.=没有可导入的新样本。
This sample’s image is missing from local storage.=本地存储中缺少这张样本的图片。
Clipboard is blocked in this browser. Use download instead.=浏览器阻止了剪贴板访问，请改用下载。
Vision request timed out or could not connect. No automatic retry was made.=图片分析请求超时或无法连接，未进行自动重试。
Invalid local vision configuration (.asa-local.json).=本地视觉配置文件 .asa-local.json 格式错误。
Invalid local vision configuration.=本地视觉配置无效。
Vision provider must be glm or xai.=视觉服务商必须为 glm 或 xai。
Invalid vision model name.=视觉模型名称无效。
Cannot read the configured vision key file. Check its path and permissions.=无法读取配置的密钥文件，请检查路径与权限。
The key file must contain only the API key, not a shell command.=密钥文件只能包含 API key，不能包含命令。
Check model/image support or content restrictions.=请检查模型、图片支持情况或内容限制。
Check the API key.=请检查 API key。
Check available API balance.=请检查 API 可用余额。
Check model permissions or content restrictions.=请检查模型权限或内容限制。
Rate limit or quota reached; check your provider console.=达到速率或额度限制，请查看服务商控制台。
Please check the provider console.=请查看服务商控制台。
Analysis was truncated. No partial result was saved.=分析结果被截断，未保存不完整结果。
The model returned no analysis text.=模型未返回分析文字。
The model returned an unreadable analysis. No result was saved.=模型返回内容无法解析，未保存结果。
Vision analysis failed.=图片分析失败。
neutral=中性
Samples=样本库
Analysis=属性分析
Patterns=偏好规律
Compare=分组比较
Profile=审美画像
Observable traits · your labels · no beauty score=观察可见特征 · 由你定义偏好 · 不做颜值评分
Upload=上传图片
Newest=最新优先
Oldest=最早优先
Name=名称
Label=偏好标签
All states=全部状态
Analyzed=已分析
Not analyzed=未分析
All tags=全部标签
Search names, tags, notes, traits=搜索名称、标签、备注、属性
Search samples=搜索样本
Sort=排序
Analysis filter=分析状态筛选
Tag filter=标签筛选
Stop=停止
All=全部
Unrated=待评价
Like=喜欢
Neutral=中性
Dislike=不喜欢
Core Reference=核心参考
Core=核心
Drop reference images=点击或拖入参考图片
Label each one Like, Neutral, Dislike, or Core Reference. Analysis only records visible traits — it does not score beauty.=请给样本标记偏好。分析只记录可见特征，不进行颜值评分。
No samples match these filters.=没有符合筛选条件的样本。
Select a sample. The model will describe what is visible. You decide whether it belongs.=请选择一张样本。模型描述可见特征，是否喜欢由你决定。
Preference label=偏好标签
Add tag=添加标签
Notes=备注
Notes stay local. They are not sent for analysis.=备注不用于图片分析；仅在你确认英文翻译时发送文字。
Analyze=分析
Re-analyze=重新分析
Analyzing…=正在分析…
Delete=删除
Keep=保留
Observable traits only. Your edits replace the model in every later count. Re-analyze keeps those edits.=只记录可见特征。统计优先使用你的修正；重新分析会保留修正。
Not analyzed yet. Run Analyze to fill the schema. You can still label, tag, and note this sample.=尚未分析。可点击“分析”，或手动填写属性；也可先添加标签和备注。
Jump to category=跳转到分类
Category=分类
Observations=观察描述
Restore=恢复模型值
Edited · restore=已修正 · 恢复
Model=模型结果
High=高
Med=中
Low=低
Hidden=不可见
Group A=A 组
Group B=B 组
All dimensions=全部维度
Like vs Dislike=喜欢与不喜欢
Core vs Like=核心与喜欢
Core vs Dislike=核心与不喜欢
Both sides are the same group, so every difference is zero.=两侧选择了同一组，因此差异为零。
Attribute=属性
Difference=差异
No medium or high confidence traits to compare in this slice.=当前范围没有中高置信度的可比较属性。
No representative image.=没有代表图片。
Preference=偏好
Tags=标签
No tags yet=尚无标签
All analyzed=全部已分析
Copy Markdown=复制 Markdown
Copy JSON=复制 JSON
Library file=样本库备份
Export library=导出样本库
Import library=导入样本库
Markdown preview=Markdown 预览
The working library already stays in this browser. Export includes images, labels, corrections, and analyses.=样本库保存在当前浏览器中。导出文件包含图片、标签、修正、分析及已生成的英文译文，请另存到本地文件夹。
1. Stronger descriptive tendencies=1. 较强的描述性倾向
2. Moderate evidence=2. 中等证据
3. Weak / uncertain tendencies=3. 较弱或不确定的倾向
4. Inferred dislike associations — not direct statements=4. 推测的负面关联（非用户明确表态）
5. Important feature combinations=5. 重要特征组合
Nothing clears the stronger descriptive bar yet.=目前没有达到较强倾向的证据。
No moderate tendencies yet.=暂无中等强度的倾向。
No weak leans recorded.=暂无较弱倾向。
No trait is both common in dislikes and scarce in the preferred pool.=暂无在负样本中常见、而在偏好样本中少见的属性。
No pair repeats in at least two preferred samples.=暂无在至少两个偏好证据组中重复出现的属性组合。
Most frequent in Like=喜欢样本中的常见属性
Most frequent in Dislike=不喜欢样本中的常见属性
No analyzed likes yet.=暂无已分析的喜欢样本。
No analyzed dislikes yet.=暂无已分析的不喜欢样本。
What separates Like from Dislike=区分喜欢与不喜欢的属性
Not enough overlapping coverage to separate the labels yet. Add analyses, or the groups may share the same visible traits.=共同可见属性的证据不足，暂不能区分；两组也可能具有相同特征。
Co-occurring traits in Like=喜欢样本中的共现特征
No pair shows up in at least two analyzed likes.=暂无至少在两个喜欢证据组中共现的特征。
Rare but strongly preferred=少见但偏好明显的特征
Needs at least 4 analyzed likes before a trait can be called rare-but-preferred.=至少需要 4 份已分析的喜欢样本才能判断。
Nothing meets that bar. Rare means under 30% of the analyzed library, in at least half of covered likes, and scarce in dislikes.=暂无达标特征：需在全库中低于 30%，在可观察的喜欢样本中至少占一半，并且在负样本中少见。
Contradictory preferences=偏好中的分歧与重叠
No split or shared trait is strong enough to call a contradiction. That can simply mean the sample is still small.=暂无足够证据说明偏好存在分歧；也可能只是样本太少。
Outlier samples=特殊样本
Outliers need a stable like-mode across at least 5 traits and 4 analyzed likes. Until then this list stays empty.=至少需要 4 个喜欢样本、5 项稳定共同特征，才能识别特殊样本。
Insufficient evidence=证据不足的维度
Every tracked field has been observed at medium or high confidence in at least 3 samples.=每个属性都已有至少 3 份中高置信度的可见记录。
No analyses yet. Patterns use your labels plus corrected attributes. Nothing here is a beauty score.=尚无分析。规律来自你的偏好标签和修正后的属性，不是颜值评分。
Positive-only library: recurring traits describe your positive references, not what you dislike. Negative boundaries and Like–Dislike separation are untested; negative samples are optional.=当前仅有正面证据：重复特征说明你喜欢的参考方向，不代表你排斥其他特征。负面边界尚未验证，无需强行补负样本。
Counts are evidence units: known clusters, otherwise subject aliases, otherwise ungrouped images (not proven independent). A unit can contain multiple states and values; percentages need not sum to 100%. Scoped labels override whole-image labels; any matching exclusion wins. Limited/invalid evidence is retained but excluded.=按证据组计数：优先使用拍摄分组，其次是对象代号，否则按未分组图片计数（不代表相互独立）。一组可包含多种状态，百分比之和不一定为 100%。局部评价覆盖整体标签，排除规则优先；有限和无效记录保留但不参与统计。
Fewer than 3 analyzed likes or core references. Strong and moderate sections stay empty on purpose.=喜欢或核心参考的证据组不足 3 个，较强和中等倾向暂时留空。
Preferred pool = Like + Core Reference. User corrections override the model. High and medium confidence only. Not-visible traits are left out of the denominator. These are descriptive tendencies, not significance tests or image prompts.=偏好组包含喜欢和核心参考。用户修正优先，只统计中高置信度属性，不可见特征不计入分母。结果是描述性倾向，不是显著性检验或生图提示词。
One side has no analyzed samples, so frequencies cannot be compared.=其中一组没有已分析样本，暂时无法比较频率。
insufficient=证据不足
anecdotal=个别线索
limited=有限
usable=可供比较
limited samples=样本有限
enough to compare=可供比较
hypothesis=待验证
supported=有支持证据
rejected=已否定
EXCLUDED=已排除
unrated=待评价
like=喜欢
dislike=不喜欢
core=核心参考
tie=相当
neither=都不喜欢
not visible=不可见
not_visible=不可见
high=高
medium=中等
low=低
Face detail=面部细节
Feature occupancy=五官占比
compact=紧凑
moderate=适中
expansive=舒展
Cheek visual space=面颊留白
narrow=窄
broad=宽
Jaw taper=下颌收窄方式
gradual=逐渐收窄
abrupt=明显收窄
minimal=很少
Expression=表情
relaxed=放松
subtle smile=浅笑
broad smile=灿烂笑容
serious=严肃
animated=生动
tense=紧张
Body detail=身体细节
Visible frame width=可见骨架宽度
obscured=被遮挡
Visible soft contour=可见软组织轮廓
lean=清瘦
full=饱满
Clothed chest contour=着装下胸部轮廓
flat=平坦
gentle=柔和
rounded=圆润
projected=突出
Apparent chest position=视觉胸部位置
higher=较高
middle=居中
lower=较低
Visible garment support effect=可见服装支撑效果
shaped=塑形
lifted=提托
compressed=压缩
uncertain=不确定
Apparent chest volume=视觉胸部体量
small=较小
Hip projection in visible view=当前角度的臀部突出程度
subtle=轻微
prominent=明显
Hip contour=臀部轮廓
straight=平直
gently rounded=轻度圆润
strongly rounded=明显圆润
Legs and feet=腿部与足部
Thigh contour=大腿轮廓
slender=纤细
Calf contour=小腿轮廓
gently curved=柔和曲线
defined=清晰
Ankle contour=脚踝轮廓
tapered=收细
Feet presentation=足部呈现
bare=赤足
hosiery covered=袜装覆盖
shoes=穿鞋
cropped=画面裁切
occluded=遮挡
Hosiery=袜装
Coverage=覆盖范围
none=无
socks=短袜
knee-high=及膝袜
thigh-high=长筒袜
tights=连裤袜
Opacity=不透明度
sheer=透明
semi-opaque=半透明
opaque=不透明
Finish=表面质感
matte=哑光
subtle sheen=微光泽
glossy=亮泽
textured=有纹理
Subject=主体
Number of subjects=主体数量
crowd=人群
not a person=非人物
Framing=取景范围
extreme close-up=局部特写
head and shoulders=头肩像
half body=半身
three-quarter=四分之三
full body=全身
environmental=环境人像
detail crop=细节裁切
Body visibility=身体可见范围
face only=仅面部
upper body=上半身
torso to hips=躯干至臀部
partial or occluded=局部或遮挡
no body=身体不可见
Pose=姿态
standing=站立
seated=坐姿
reclining=躺卧
walking=行走
mid-action=动态瞬间
static portrait=静态人像
looking at camera=看向镜头
looking away=看向别处
candid=自然抓拍
Orientation=朝向
frontal=正面
profile=侧面
back=背面
mixed=混合
Face=面部
Face shape=脸型
oval=椭圆
round=圆形
square=方形
heart=心形
long=偏长
diamond=菱形
Facial proportions=五官比例
balanced=均衡
larger eyes=眼睛较大
smaller eyes=眼睛较小
longer midface=中庭较长
shorter midface=中庭较短
prominent nose=鼻部突出
small nose=鼻部较小
full lips=嘴唇饱满
thin lips=薄唇
Cheek fullness=面颊饱满度
Jawline=下颌线
soft=柔和
pointed=尖窄
Visual maturity=视觉成熟度
youthful appearance=显年轻
adult=成年人
mature=成熟
ambiguous=难以判断
Feature prominence=突出五官
eyes=眼睛
lips=嘴唇
nose=鼻子
brows=眉毛
Hair=头发
Length=长度
none or shaved=无发或剃发
very short=极短
short=短
very long=很长
Shape=形态
wavy=波浪
curly=卷曲
coily=紧密卷曲
slicked=贴顺
messy=蓬乱
structured=结构分明
Bangs=刘海
side-swept=侧分刘海
curtain=八字刘海
wispy=轻薄刘海
Tied / loose=束发或披发
loose=松散
partially tied=半扎发
tied up=扎起
braided=编辫
covered=覆盖
Volume=蓬松度
voluminous=蓬松
Texture=质感
smooth=顺滑
wet-look=湿发效果
Body silhouette=身体轮廓
Head-to-body proportion=头身比例
naturalistic=自然
slightly large head=头部略大
stylized large head=风格化大头
elongated=拉长
not enough visible=可见范围不足
Shoulder / waist / hip=肩腰臀关系
defined waist=腰线明显
broad shoulders=宽肩
narrow shoulders=窄肩
wider hips=臀部较宽
rectangular=矩形
hourglass-like=沙漏形
Limb proportions=四肢比例
shortened=偏短
Overall silhouette=整体轮廓
slim=纤瘦
athletic=运动型
tall and elongated=高挑修长
Clothing=服装
Garment categories=服装类别
none visible=不可见
casual everyday=日常休闲
formal=正式服装
costume or fantasy=角色或幻想服装
historical costume=历史服装
sportswear=运动服
outerwear=外套
sleepwear=睡衣
uniform-like=制服风格
minimal coverage=覆盖较少
Silhouette=服装轮廓
fitted=贴身
oversized=宽大
flowing=飘逸
not applicable=不适用
Materials=材质
matte fabric=哑光织物
knit=针织
denim-like=牛仔质感
leather-like=皮革质感
silk-like sheen=丝绸光泽
synthetic shine=合成材质光泽
wool-like=毛料质感
unclear=不清楚
Layering=层次
single layer=单层
light layers=轻度叠穿
heavy layers=多层叠穿
Ornament=装饰
ornate=繁复
Composition=构图
Shot scale=景别
close-up=特写
medium close=近景
wide=远景
extreme wide=大远景
Subject position=主体位置
centered=居中
left third=左侧三分点
right third=右侧三分点
lower frame=画面下部
upper frame=画面上部
edge=边缘
off-center=偏离中心
Negative space=留白
tight=紧凑
generous=充足
dominant empty=大面积留白
Symmetry=对称性
symmetric=对称
near-symmetric=近似对称
asymmetric=不对称
strongly asymmetric=明显不对称
Visual balance=视觉平衡
left-weighted=重心偏左
right-weighted=重心偏右
top-heavy=重心偏上
bottom-heavy=重心偏下
unstable=不稳定
Camera=镜头
Viewpoint=视角
eye level=平视
slight high=略微俯视
high angle=俯视
slight low=略微仰视
low angle=仰视
overhead=顶视
Perspective strength=透视强度
mild=轻微
strong=强烈
extreme=极强
Focal-length character=焦段观感
wide-angle look=广角观感
normal look=标准焦段
short-tele look=中长焦观感
long-tele compressed=长焦压缩感
macro=微距
Depth of field=景深
deep=深景深
shallow=浅景深
very shallow=极浅景深
Lighting=光照
Soft / hard=软硬光
hard=硬光
Direction=方向
side=侧面
rim=轮廓光
top=顶部
under=底部
ambient diffuse=环境漫射
multiple=多光源
Contrast=反差
Exposure=曝光
underexposed=曝光不足
bright=明亮
overexposed=过曝
Natural / artificial look=自然光或人造光
daylight=日光
window=窗光
golden hour=黄金时段
overcast=阴天
warm artificial=暖色人造光
cool artificial=冷色人造光
studio=影棚
neon=霓虹
Color=色彩
Saturation=饱和度
muted=低饱和
natural=自然
vivid=鲜艳
hyper-saturated=极高饱和
near-monochrome=近单色
Temperature=色温
cool=冷色
neutral=中性
warm=暖色
Dominant colors=主色
black=黑色
white=白色
gray=灰色
beige=米色
brown=棕色
red=红色
orange=橙色
yellow=黄色
green=绿色
teal=蓝绿色
blue=蓝色
purple=紫色
pink=粉色
gold=金色
Color contrast=色彩对比
Tonal range=影调
high-key=高调
mid-key=中调
low-key=低调
full range=全影调
Rendering=成像风格
Medium=媒介
photograph=照片
cinematic still=电影画面
film photograph=胶片照片
digital render=数字渲染
illustration=插画
anime=动漫
painterly=绘画感
3d render=三维渲染
mixed media=混合媒介
Realistic / stylized=写实或风格化
realistic=写实
lightly stylized=轻度风格化
strongly stylized=强烈风格化
abstract=抽象
Surface texture=表面纹理
fine grain=细腻颗粒
smooth digital=平滑数字质感
noisy=噪点明显
clean=干净
Environment=环境
Indoor / outdoor=室内外
indoor=室内
outdoor=室外
studio void=纯色影棚
Visual complexity=视觉复杂度
sparse=简洁
dense=密集
cluttered=杂乱
Context=场景
domestic interior=家居室内
urban=城市
nature=自然
architecture=建筑
abstract backdrop=抽象背景
night exterior=户外夜景
coastal=海滨
Period / retro cues=时代或复古线索
contemporary=当代
retro=复古
vintage=怀旧
futuristic=未来感
timeless=无明显时代
not evident=不明显
Mood=氛围
Primary mood=主要氛围
calm=平静
intimate=亲近
distant=疏离
dramatic=戏剧感
playful=俏皮
melancholic=忧郁
everyday=日常
elegant=优雅
cheerful=愉快
somber=沉郁
Secondary mood=次要氛围
Image quality=图像质量
Over-smoothing=过度磨皮
Excessive gloss=过度光泽
Overexposure=过曝问题
Artificial skin texture=不自然皮肤质感
Anatomical problems=人体结构问题
possible=可能存在
clear=明显存在
Visual artifacts=图像伪影
`;
export const ZH: Record<string, string> = Object.fromEntries(
  entries
    .trim()
    .split("\n")
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
const fragments: Record<string, string> = {
  samples: "张样本",
  sample: "张样本",
  analyzed: "已分析",
  "not analyzed": "未分析",
  shown: "项结果",
  labeled: "整体标签",
  "scoped analyses": "局部分析",
  "whole-image": "整体标签",
  Corrections: "人工修正",
  "Preferred analyzed": "偏好组已分析",
  "Dislike analyzed": "负面组已分析",
  Model: "模型",
  confidence: "置信度",
  pp: "百分点",
  Tag: "标签",
  "entire category": "整个分类",
  manual: "手动",
  whole: "整体",
  preferred: "偏好组",
  dislike: "不喜欢",
  "Core references": "核心参考",
  Evidence: "证据",
  "enough to compare": "可供比较",
  like: "喜欢",
};
const phrases = Object.entries({ ...ZH, ...fragments }).sort((a, b) => b[0].length - a[0].length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phraseRegex = new RegExp(
  "(?<![A-Za-z])(?:" + phrases.map(([s]) => escape(s)).join("|") + ")(?![A-Za-z])",
  "g",
);
const phraseMap = Object.fromEntries(phrases);
export function zh<T>(value: T): T {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (ZH[trimmed]) return value.replace(trimmed, ZH[trimmed]) as T;
  // Existing bilingual research labels become Chinese without altering stored values.
  if (/^[\u3400-\u9fff]/.test(trimmed) && /\s*\/ [A-Za-z]/.test(trimmed))
    return value.split(/\s*\/ [A-Za-z]/)[0] as T;
  const patterns: [RegExp, (...args: string[]) => string][] = [
    [/^Could not read (.+)\.$/, (_, name) => `无法读取 ${name}。`],
    [
      /^Re-analyzed\. Kept (\d+) of your corrections?\.$/,
      (_, n) => `已重新分析，保留了你的 ${n} 项修正。`,
    ],
    [/^Stopped after (\d+) samples?\.$/, (_, n) => `处理 ${n} 张后已停止。`],
    [/^Analyzed (\d+) of (\d+)\.$/, (_, n, total) => `已分析 ${n}/${total} 张。`],
    [/^Analyzing (\d+)\/(\d+)\.$/, (_, n, total) => `正在分析 ${n}/${total} 张。`],
    [/^(\d+) fields under 3 observations$/, (_, n) => `${n} 项属性不足 3 份观察`],
    [
      /^Configure (.+) or a local key file before analysis\.$/,
      (_, name) => `请先配置 ${name} 或本地密钥文件，再进行分析。`,
    ],
    [
      /^(GLM|XAI) analysis failed \((\d+)\)\. (.+)$/,
      (_, provider, code, hint) => `${provider} 分析失败（${code}）。${zh(hint)}`,
    ],
    [
      /^Differs on (\d+)\/(\d+) traits that are otherwise common among likes\.$/,
      (_, n, total) => `在喜欢组常见的 ${total} 项可比较属性中，有 ${n} 项不同。`,
    ],
    [
      /^Labeled Dislike, but it matches (\d+)\/(\d+) traits common among likes\.$/,
      (_, n, total) => `虽然标为不喜欢，但 ${total} 项可比较属性中有 ${n} 项与喜欢组一致。`,
    ],
    [
      /^(.+): “(.+)” is common in both likes \((.+)\) and dislikes \((.+)\)\. It does not separate the labels\.$/,
      (_, field, value, a, b) =>
        `${zh(field)}“${zh(value)}”在喜欢组（${a}）和不喜欢组（${b}）中都常见，不能用于区分偏好。`,
    ],
    [
      /^Within likes, (.+) splits between “(.+)” \((\d+)\) and “(.+)” \((\d+)\)\. That may be two contexts, not one preference\.$/,
      (_, field, a, n, b, m) =>
        `喜欢组的${zh(field)}分为“${zh(a)}”（${n}）与“${zh(b)}”（${m}），可能对应两种情境，而不是单一偏好。`,
    ],
    [/^Analyze (\d+) unanalyzed$/, (_, n) => `分析 ${n} 张未分析图片`],
    [
      /^Added (\d+) images?\. Label them before looking for a pattern\.$/,
      (_, n) => `已添加 ${n} 张图片，请先标记偏好，再查看规律。`,
    ],
    [
      /^Analysis stored for (.+)\. Correct anything that is wrong — edits override the model\.$/,
      (_, name) => `${name} 的分析已保存。请修正不准确的属性，统计以你的修正为准。`,
    ],
    [
      /^(Exported|Imported) (\d+) samples?\.$/,
      (_, op, n) => `已${op === "Exported" ? "导出" : "导入"} ${n} 张样本。`,
    ],
    [/^(.+) copied\.$/, (_, name) => `${name} 已复制。`],
    [
      /^Like has (\d+) analyzed samples? and Dislike has (\d+)\. Below 8 per group, treat every percentage as a hint, not a stable finding\.$/,
      (_, a, b) =>
        `喜欢组有 ${a} 份分析，不喜欢组有 ${b} 份。每组不足 8 份时，百分比仅供探索，不能视为稳定结论。`,
    ],
    [
      /^Smaller side has (\d+) analyzed samples?\. Differences under 8 samples per side are exploratory\.$/,
      (_, n) => `较小的一组有 ${n} 份分析。每组不足 8 份时，差异仅供探索。`,
    ],
  ];
  for (const [pattern, render] of patterns) {
    const m = trimmed.match(pattern);
    if (m) return render(...m) as T;
  }
  return value.replace(phraseRegex, (match) => phraseMap[match]) as T;
}
