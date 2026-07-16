/* ============================================
 * 雷诺曼牌功能 - 牌库浏览 + 占卜
 * ============================================ */

(function() {
  'use strict';

  // ==================== 原始雷诺曼牌数据 ====================
  // 格式: 牌名|编号|花色(len)|正位|逆位|核心|情感|事业|财运|健康|学业|人际|时间|建议|警示|元素|对应|数字|意象|一句话
  const RAW_LENORMAND = [
    "骑士|1|len|策马而来的信使，代表迅速到来的消息、行动或一位充满活力的年轻男性。事情将加速推进，你等的人或答案正在路上。|消息延迟、坏消息或行动受阻，事情推进缓慢，需要核查信息的准确性。|风风火火奔来的骑手，带来启动的能量。它催促你立刻响应，不要迟疑。|心动的对象可能主动联系，或出现一段快速发展的浪漫。单身者有望被追求。|有人推荐你机会，或你的简历、申请得到迅速回应。适合主动出击。|进账消息到来，可能是汇款、报销或意外的奖金。关注账户变动。|健康好转讯息，恢复速度加快，适合开始新的锻炼计划。|考试通知、录取消息即将抵达。若在等成绩，很快会有结果。|有人主动来访或联系你，社交动态活跃，可能有朋友突然约见。|即刻/数日|消息就在路上，保持手机畅通，准备好说“好”。|空欢喜、被骗消息。别被速度和外表迷惑，核实来源。|火|红心9|1|被风风火火地奔来——『我来接你』不是客气，是从那么远的地方真的就赶到了",
    "三叶草|2|len|偶然的好运、小确幸、短暂的幸运窗口。抓住此刻，它像三叶草一样罕见。|短暂失意、错失运气，或幸运只停留片刻便溜走，需降低期待。|绿色希望，生命里不期而遇的小礼物。它提醒你留意身边的微小美好。|轻松的暧昧期，短暂的浪漫火花。不必急于定义，先享受这份轻盈。|意外加薪、奖金或一笔计划外的进账。可能来自副业或红包。|偏财、彩票运、折扣捡漏。小进小出，适合试试手气但不贪多。|小感冒康复，精神恢复快。身体给出积极信号。|临时抱佛脚奏效，突击复习碰巧考到。但别依赖运气。|偶遇旧友，或与新认识的人快速产生愉快交谈。|短期/三日|抓住此刻，像捡到四叶草一样感恩。|沉迷小运气，把偶然当必然，忽略踏实积累。|土|方块6|2|被默默放进每一个普通早晨——一杯刚好温度的水、一句『今天没事吧』，琐碎得不动声色",
    "船|3|len|远航、旅行、远距离、外贸。船已启航，你正在驶向新的彼岸。拓展视野，跨越边界。|延迟、迷失、搁浅。旅途受阻，原计划被拖慢，或感到漂泊无依。|离开熟悉港湾的勇气。它指向地理或心理上的远行，以及随之而来的成长。|异地恋、网恋或与远方的人有重要连接。距离是考验也是催化剂。|海外业务、外贸、出差或跨国合作。你的市场不在近处。|外汇/外贸收入，或与远方有关的进账。货币兑换需留意。|远途旅行注意水土不服，提前备药。适合规划一次休养之旅。|留学、远程教育、语言学习。知识来自他乡。|远方的朋友，或将要结识海外人脉。有人从远方而来。|三周/启程|跨出舒适圈，船已下水，顺流而行。|远离失联，切断不该断的连接，或逃避现实。|水|黑桃10|3|被一直惦记着——『你那边几点了』『睡了没』，再远的距离都不影响每天的牵挂",
    "房子|4|len|家、稳固、产业、根基。四壁之内，你感到安全与归属。这是安身立命之所。|无家可归、家庭冲突、根基动摇。安全感被侵蚀，或与家人出现裂痕。|温馨坚固的小屋，象征内心的基地。所有关于“根”的事务都与此牌有关。|稳定家庭、同居或订婚。关系进入筑巢阶段，想要共同建立一个家。|家族企业、在家工作、房地产相关事业。稳定压倒一切。|不动产买卖、装修、储蓄购房。金钱流向家的建设。|家族遗传健康需留意，居家环境直接影响身体。适合整理房屋。|家学、家庭教育或专注于某一领域深耕。在家学习效率高。|家人般的密友，或与亲属互动频繁。社交圈缩小但亲密。|长期/安居|建立你的根，无论是一套房还是一个习惯。|画地为牢，过度守成，害怕离开熟悉的环境。|土|红心K|4|被一起把家具一件件搬进来——锅、被子、台灯、放谁的牙刷在哪一格，一点一点地真的成了家",
    "树|5|len|健康、根基、缓慢成长、家族。像树一样耐心生长，你的努力会年轮般扎实积累。|疾病、根浅、成长停滞。生命力变弱，或家庭根基出现蛀洞。|深扎泥土的活木，代表生命力、时间累积与代际传承。|关系基础深厚，可能是长跑型恋情，或与某人有着命定的纠缠。|长期事业，稳步上升，不可急功近利。适合可持续的领域。|长期投资，复利增长。财务如同种树，需要耐心等它成荫。|身心健康是本，这张牌强调整体生命力。适合中医调理。|长期学问，需要系统学习。根基不牢则后续难进。|长期友谊，老朋友如大树可靠。你的支持系统深厚。|长期/成长期|耐心生长，把时间当作盟友。|根基不稳，看似繁盛实则空心。别忽略内在。|土|红心7|5|被以年为单位地爱着——不是一时的炽热，是十年后还会用同样的眼神看人的那种长情",
    "云|6|len|混乱、迷茫、麻烦、不确定。乌云遮天，你暂时看不清前路。先停下来，别在迷雾中做决定。|拨云见日、清晰。混乱即将过去，真相浮现。|变幻莫测的云团，象征精神上的混沌与暂时的困惑。它说：等待风吹雾散。|关系不明朗，暧昧不清或彼此有误解。需要一次坦诚的对话。|工作变数多，上级指令不清，或行业前景模糊。暂缓重大决策。|财务不清，账目混乱或有隐情。检查流水，别轻信口头承诺。|身体小毛病多，不明原因的不适。可能是心理紧张造成。|思绪乱，学不进去。先厘清框架再深入。|被流言围绕，或对人产生误解。减少猜测，直接询问。|短期/数日|等云散，阳光自现。保持清醒即可。|被困其中，把想象当现实，不断放大恐惧。|风|梅花K|6|被一个准确的回答温柔地驱散迷雾——『我们没事』『别多想』，那种被一句话稳住的安心",
    "蛇|7|len|背叛、算计、复杂、迂回。草丛中蜿蜒的蛇，暗示有人藏着心机，或事情需要迂回处理。|真相、解决、友谊。阴谋被揭穿，或你巧妙避开了陷阱。|蜿蜒之蛇，象征聪明、魅力与危险的结合体。它提醒你保持警惕，也暗示性张力。|有第三者介入，或关系中出现欺骗。对方可能隐瞒了什么。|职场小人，有人在你背后设套或抢功。重要文件需留底。|被设套，财务有被欺诈的风险。别轻易替人担保或借钱。|消化系统问题，注意饮食。也可能是心理上的“毒”需要排解。|被人误导，学到错误信息。核实资料来源。|是非朋友，表面和善实际另有目的。靠近让你放松的人。|短期/危险期|绕过陷阱，不必直接冲突，用智慧化解。|被吓住不动，过度猜疑破坏关系。别让恐惧主导。|水|梅花Q|7|被识破所有的伪装——所有靠近的人的心思都被看穿，所有的陷阱都被先一步避开",
    "棺材|8|len|终结、疾病、重大转变、葬礼。箱子合上，某事不可挽回地结束了。让它过去。|缓慢复苏、转机。终结后的新芽，最坏的时刻正在过去。|封闭的棺木，象征彻底的句点。也是转变与重生的前夜。|分手到位，关系画上句号。或是某段情感的彻底埋葬。|失业、项目终结，公司倒闭。一个职业阶段结束，需要重新规划。|重大损失，投资失败或大笔支出。必须接受并止损。|大病，需严肃对待。可能暗示手术或长期休养。|学业中断，可能是休学或放弃某门学科。重新选择方向。|失去朋友，或主动断绝一段消耗型关系。圈子清空。|终结期/数周|让它过去，不放手无法迎来新生。|抗拒终结，死守已经死去的事，痛苦延长。|土|方块9|8|被陪着告别——所有的『放不下』都被允许放不下，直到真的能放下的那天",
    "花束|9|len|礼物、感谢、邀请、美好。捧花而来，这是惊喜与赞美。打开心，接收世间的善意。|虚情假意、失望。礼物背后有目的，或期待落空。|缤纷的花束，代表愉悦、赞赏与表面的美好。它说：你值得被庆祝。|被表白、收到礼物或惊喜约会。关系中充满浪漫仪式感。|被赞赏、获奖、得到公开表扬。你的工作成果被看见。|奖金、馈赠、红包或意外的礼物收入。慷慨的能量。|愉悦放松，精神压力减轻。适合美容、SPA等悦己之事。|得到表扬，学业上的小成就被认可。增加自信。|被邀请聚会，社交场上受欢迎。身边充满善意。|短期/赠予日|敞开心接收，大方说谢谢，也大方给予。|表面热闹，沉溺于虚华，忽略实质内容。|风|黑桃Q|9|被像捧着花一样捧着——所有的日子都不只是节日，每一天都会有理由送一束花",
    "镰刀|10|len|突变、切断、危险、收割。镰刀一挥，迅速决绝地割断。事情突然终止，但也帮你做了选择。|安全、避开危险。及时抽身，躲过一劫。|挥下的锋利镰刀，代表突如其来的切割。它是收割也是伤害，需要你果断。|突然分手，或必须与某人一刀两断。长痛不如短痛。|被裁员、项目被砍，或主动决绝辞职。职业断崖出现。|突发损失，大额支出或被割韭菜。务必保管好账户。|意外伤，尤其利器。做手术也算一种“切断”。|考试突变，如取消或成绩被卡。需有备用方案。|断绝关系，与某人决裂。圈子被人为清除。|突发/即刻|快刀斩乱麻，拖延只会更痛。割了就割了。|被伤到，或成为伤人的那把刀。后果可能无法挽回。|火|方块J|10|被替着斩掉所有的烦扰——那些舍不得切但必须切的关系、感情、习惯，都有人替你下手",
    "鞭子|11|len|争吵、重复、运动、性张力。鞭子挥下，带来反复的冲突或持续的激情。需要找到矛盾的根源。|和解、停止争执。争吵平息，或重复的折磨终于结束。|交缠的鞭绳，象征摩擦、重复与强烈的吸引力。它暗示某种消耗性或激情的循环。|争吵频繁但未必分手，或是充满张力的关系。性吸引力强。|内耗多，重复劳动，或与同事有长期摩擦。流程需优化。|反复亏损，或同一笔账来回拉扯。避免情绪化消费。|运动伤，或劳损。适合规律性锻炼，但注意热身。|反复练习，刻意训练。学习需要耐力。|反复吵架的朋友，吵不散但累。需要设立边界。|短期/反复期|吵完了好好抱抱，别让轮回继续。找到核心问题。|长期内耗，沉迷于争执或激情游戏，忘了初衷。|火|梅花J|11|被吵完之后立刻和好——『我错了』『不算数』，那种不让冷战过夜的较真",
    "鸟|12|len|两人、沟通、小八卦、紧张。一对小鸟叽叽喳喳，代表频繁的交流与信息交换。关键在倾听。|沉默、沟通中断。对话停滞，或信息被曲解。|成双的鸟雀，象征对话、协商和短途消息。也暗示焦虑型的思虑。|两人关系，聊天频繁，需要大量沟通来维系。异地恋常用通讯。|开会、演讲、谈判多。你的口才是关键工具。|小笔进出，资金流动频繁。注意手续费和小额支出。|呼吸系统，咽喉、肺部需留意。说话多的人要护嗓。|讨论小组、口语练习。适合辩论或交换意见。|话多的朋友，或周围有小道消息流传。慎言。|短期/沟通期|多交流，但说重点。打开耳朵。|说得太多，泄露秘密或造成误会。沉默有时是金。|风|方块7|12|被想说话的时候永远有人接住——所有的『跟你说一件事』都从来不会被打发",
    "孩子|13|len|新开始、天真、小事、年幼。纯真的孩童，代表初生、简单与不成熟。用孩童的眼光看世界。|幼稚、不成熟。事情被处理得太过儿戏，或缺乏责任感。|稚嫩的孩童，象征起点、小而美的事物，以及真诚无邪的那一面。|新恋情萌芽，或关系中充满简单的快乐。也可能指向与孩子相关的事。|新人入职，或开启一个小型副业。从零学起。|小笔启动，积蓄有限但充满希望。适合储蓄计划开始。|儿童健康，或身体像孩子般有活力。也要注意小病小痛。|入门学习，像孩子一样吸收知识。保持好奇心。|小辈，或需要你照顾的年轻人。社交轻松。|短期/初生期|带着童心，事情可以简单化。享受过程。|不够成熟，逃避成人责任。别一直当孩子。|风|黑桃J|13|被像孩子一样被偏爱——撒娇可以、闹脾气可以、任性也可以，所有的『不懂事』都被觉得是可爱",
    "狐狸|14|len|狡诈、谨慎、警觉、虚伪。狐狸出没，提醒你周围可能有人心机不纯。保持聪明，看穿不揭穿。|识破、真诚。假面具被摘掉，真相显露。|警觉的狐狸，象征机敏、求生欲和策略。它告诫你要多观察，少暴露底牌。|有人不诚实，或关系中有试探、算计。别太快交出信任。|职场小人，办公室政治。保护自己的创意和资源。|被欺诈风险，小心投资骗局或财务陷阱。合同需过目。|警觉性，关注身体发出的微小信号。防患未然。|被同学算计，或竞争中有不公平手段。独立作业更安全。|伪朋友，有人表面亲近实则另有所图。保持距离。|短期/警觉期|看穿不揭穿，把底牌护好。用智慧周旋。|疑神疑鬼，信任崩塌，自己也变得难以接近。|风|梅花9|14|被认真地警告——所有的『这个人离他远点』都不是吃醋，是真的看穿了对方的算计",
    "熊|15|len|力量、财力、保护、上位者。熊站立而起，彰显强大的力量与资源。你可借势，或你就是那力量。|失去优势、资源衰退。靠山倒了，或你的竞争力减弱。|壮硕的熊，象征保护、财力与权威。它代表一位有实力的人物，或你内在的力量。|强势可靠的伴侣，给你安全感。他像熊一样护着你。|有力的上级、大客户或投资人出现。也可指你成为团队的靠山。|大笔财力，资金雄厚，或获得强力资金支持。财务安全。|身强体壮，恢复力强。但也要警惕肥胖或压力型暴食。|学术权威，跟随厉害的老师。或你成为该领域的“熊”。|有实力的朋友，或能为你提供庇护的人脉。圈子有靠。|长期/优势期|借力使力，或成为别人的力量。别浪费这身“膘”。|被压制，活在强势者的阴影下，失去自我声音。|土|梅花10|15|被绝对的力量挡在身后——那种『有人在』的安全感，能让所有的怕都散掉",
    "星星|16|len|希望、指引、灵感、线上。繁星点亮夜空，你被理想与愿景指引。追随你的星。|失去希望、虚幻。梦想脱离现实，或希望破灭。|闪烁的星辰，象征远方的指引、精神追求与互联网连接。|理想型、网恋，或关系充满灵性共鸣。远距离的精神连接。|愿景明确，清楚自己要什么。适合做长期规划。|稳定增长，虽慢但有方向。财务蓝图清晰。|心情舒畅，压力释放。星星有疗愈能量。|灵感学习，适合创意、占星、天文等。|网友、精神社群。可能通过网络结识知己。|长期/夜晚|追随你的星，它会带你走出黑暗。|过度理想化，脚不沾地，忽略现实阻碍。|风|红心6|16|被像追星一样追——『你最特别』不是恭维，是发自内心的『所有星星里你最亮』",
    "鹳|17|len|变化、搬迁、转变、进展。长腿鹳鸟起飞，带来搬家和积极的转变。主动求变吧。|停滞、不动。抗拒变化，因而卡在原地。|候鸟，象征迁移、升级与向着更好环境移动的渴望。|搬家、关系升级，如同居或换到下一个阶段。情感上的迁居。|跳槽、转型、调岗。事业上的地理或职能移动。|资金转移，可能换银行、换理财平台或买房。|身体调整，开始新疗程，或搬家后健康改善。|换专业、转学。学习环境的转换。|换圈子，结交新朋友，或老友迁徙而来。|中期/迁移期|主动求变，搬到更适合的“池塘”。|拒绝改变，明知该走却害怕挪窝。|水|红心Q|17|被一起搬一次又一次的家——所有的『去哪都行』都是真心话，重点不是去哪，是和谁",
    "狗|18|len|忠诚、朋友、支持、陪伴。忠犬相随，代表毫无保留的支持与友谊。相信你的朋友。|背叛、不忠、虚伪。你以为的朋友可能并非真心，或你感到被出卖。|忠心耿耿的狗，象征可靠的人际关系、陪伴与守护。|忠诚的伴侣，关系基于深厚的信任与友情。爱像家人。|得力同事，或值得信赖的下属。团队有粘合剂。|可靠的合伙，财务上有人帮你把关。共同账户稳固。|健康守护，身体的忠实反馈。规律生活如同养狗。|学习伙伴，互相督促的学伴。适合结伴学习。|挚友，像狗一样不管发生什么都站在你身边。|长期/友谊|相信你的朋友，也做别人的狗。友情需要双向。|被假朋友利用，过度讨好错付真心。|土|红心10|18|被像狗狗一样毫无保留地喜欢——不计较得失、不衡量回报、就是单纯地『就是你』",
    "塔|19|len|官方、机构、孤立、权威。高塔耸立，代表体制、独处与官方事务。有时你需要借助系统。|被边缘化、失势。在体制内受排挤，或感到孤立无援。|孤高的塔，象征官方的力量、孤独的权威，也提醒你审视与体制的关系。|关系疏远、地位差，可能因阶层或年龄差距感到隔阂。|公职、大企业、体制内工作。适合处理政府或大型机构事务。|官方资金，如贷款、补贴、退税。需走流程。|医院/正规检查，不要讳疾忌医。相信专业机构。|官方考试、学历认证。需要符合规范。|官方关系，社交局限于正式场合。或感到社交孤独。|长期/官方|借助系统，按规矩办事。塔虽孤高但也坚固。|过度官僚，被规则框死，或主动孤立自己。|土|黑桃6|19|被走进世界最孤独的那座塔——再封闭的人也愿意为某个人开门，再独处的人也愿意留一个钥匙",
    "花园|20|len|公众、聚会、社交、网络。繁花似锦的花园，你走入人群。享受聚会，但别迷失。|被忽视、退场。在人群中感到孤独，或想逃离公众视线。|公开的花园，象征社交圈、公众形象与外部世界。|公开关系，被朋友知晓。或通过社交活动结识对象。|公关活动、市场推广、需要抛头露面的工作。|众筹，或与社群消费有关。金钱流动公开。|社交健康，多参与团体活动有利身心。|社团、小组学习。适合公开课或社群学习。|大圈子，认识很多人但未必深交。网络活跃。|短期/公开期|进入人群，展示自己。但要有边界。|被淹没，过度社交消耗自我，失去独处能力。|风|黑桃8|20|被在人群里第一眼找出——不需要挥手，不需要呼喊，那双眼睛永远先看向你",
    "山|21|len|障碍、延迟、挑战、沉重。高山横亘，前方有大困难。绕行或攀登，选择在你。|障碍消除、穿越。克服了难题，或发现山没有想象中高。|难以撼动的障碍，代表重大阻力、慢性问题或强大的对手。|关系阻力大，家人反对或彼此心防厚重。需要耐心融化。|项目卡壳，遇到难以突破的瓶颈。需要额外资源或时间。|资金冻结，或有一笔大支出暂时无法动用。|慢性病，治疗需长期抗战。注意骨骼、关节。|考试瓶颈，一门科目屡考不过。需要换方法。|与人结怨，存在难以化解的矛盾。或人际关系上遇冷。|长期/瓶颈|绕行或攀登，别拿头撞。策略比蛮力重要。|强行硬撞，消耗自己且无进展。接受限制。|土|梅花8|21|被一起翻过去——不是替你扛走，是手拉手地一步一步爬，到山顶时你说累了也不会丢下",
    "十字路口|22|len|选择、分岔、多重可能。你站在路口，每条路都通向不同未来。权衡后必须决断。|犹豫、被迫选择。被逼到必须选的境地，或选择错误。|分岔的道路，象征决定性的节点。自由与焦虑并存。|关系选择期，可能面临多角关系或必须决定下一步。|换工作选择，几个offer或方向需要比较。|投资选择，资产配置的调整。分散还是集中？|治疗方案选，第二意见很重要。|选专业、选学校。未来方向在此一举。|选朋友，或决定加入哪个圈子。人际取舍。|短期/抉择期|权衡后决断，选了就走。全选等于没选。|无限拖延，错过最佳时机，或让自己被选择。|风|方块Q|22|被一起站在分岔口——『你选什么我都跟你走』，那种把决定权放心地交出来的信任",
    "老鼠|23|len|损耗、焦虑、慢性流失。老鼠偷食，财富或精力在不知不觉中流失。找出漏洞！|止损、恢复。找到漏洞并堵住，消耗停止。|啃噬的老鼠，象征慢性破坏、烦扰的小人与内心的啃咬感。|关系慢慢冷下来，或小事不断消磨感情。需要排查问题。|资源被偷，如项目被抢功，或精力被杂事耗尽。|慢慢亏损，小额支出不断，或投资持续缩水。记账！|慢性消耗性疾病，或精力被焦虑啃食。注意亚健康。|心思被分散，无法专注。清理干扰源。|被慢慢疏远，朋友圈逐渐冷清。可能有人散播负面。|长期/损耗期|找出漏洞，别让老鼠继续咬。止损就是赚。|视而不见，任由消耗继续，最终伤及根基。|土|梅花7|23|被替着挡掉所有的小消耗——那些日常的烦躁、不安、累，都被悄悄分担过去",
    "心|24|len|爱、激情、真心、感情核心。红心跳动，纯粹的爱意显现。跟随真心，这是情感的核心。|失恋、无爱、伤心。心碎了，或感受不到爱。需先爱自己。|跳动的心脏，象征最深的感情、同理心和关系的本质。|热恋、真爱，或关系中的激情时刻。这是灵魂层面的吸引。|热爱的工作，你为这份事业投入情感。也是心之所向。|为爱投入，花在爱人或热爱之事上的金钱。觉得值。|心血管系统直接相关，情绪对心脏影响大。保持愉悦。|为爱学习，因兴趣而钻研。学你真正所爱。|有感情的朋友，社交圈建立在真心之上。珍惜。|短期/动心日|跟随真心，它是你最好的导航。别用脑过度。|玩弄感情，把心当游戏。伤人也伤己。|水|红心J|24|被毫无保留地给出全部——不是分一点点的喜欢，是『全部就这么多，都给你』的彻底",
    "戒指|25|len|承诺、契约、循环、婚姻。金色指环，代表郑重的承诺与闭合的回路。这是约定。|毁约、分手、承诺被打破。循环断裂，需要重建信任。|没有尽头的圆环，象征结合、协议与重复的周期。|订婚、结婚，或关系进入契约阶段。非正式的承诺也算。|签合同，长期合作达成。工作关系正式化。|长期合约，如保险、定期理财。财务上的绑定。|长期承诺型治疗，或周期性复健。遵守医嘱。|长期学习契约，如报班、师徒协议。坚持周期。|结义、拜把子，或成为彼此生命中重要的人。|长期/约定日|信守承诺，戒指一戴，意味着责任。|被绑住，感觉是束缚而非自愿。审视约定是否公平。|土|梅花A|25|被戴上一枚永不取下的戒指——『以后』『一辈子』『不会变』，不是冲动的话，是认真办的事",
    "书|26|len|秘密、知识、学习、未公开。合上的书中藏着未知。你需要学习，或有隐情待揭。|秘密揭穿、无知。书打开了，真相曝光，或发现知识盲区。|封存的卷册，象征知识、秘密和尚未披露的信息。|暗恋/隐秘关系，感情未公开。或对方有隐瞒之事。|商业机密，项目需保密。从事研究、教育类工作。|未公开收入，或藏有私房钱。财务不透明。|内科疾病，或需进一步检查才能确诊。身体藏着秘密。|深度学习，钻研专业书籍。适合闭关读书。|秘密的友情，或有不愿为人道的社交关系。|长期/未揭|温故知新，把书读厚再读薄。秘密待时机。|过度藏匿，隐瞒导致信任危机。或知识僵化。|风|方块10|26|被像研究一本书一样地反复读——所有的小情绪、小习惯、小毛病，都被认真翻过又翻过",
    "信|27|len|文件、信息、书写沟通。信封带来书面消息。检查信箱，重要通知可能抵达。|信息丢失、谎言。寄丢的信，或收到虚假信息。|封口的信件，象征邮件、文档、证书等一切书面形式的交流。|情书/重要消息，表白或澄清关系。文字比语言有力。|合同/通知，Offer或解雇信。正式职场沟通。|账单/票据，财务上的书面凭证。注意对账。|检查报告，体检结果或诊断书。关注白纸黑字。|考试通知、成绩单。学业上的文书往来。|来信，久违的朋友的消息。或需要书面沟通的社交。|短期/讯息日|留下书面凭证，重要事情落于文字。|信息错失，漏看关键邮件或忽略细则。|风|黑桃7|27|被认真写成的每一封信——所有的文字都不是敷衍，所有的『晚安』都是手打出来的",
    "男士|28|len|关键男性、咨询者。牌中的男士，可指代问卜者自己（若是男性），或生命中重要的男性角色。|远离的男性，或该男性带来的负面影响。|画像般的男人，聚焦于一个具体的男性形象。他可能是你、伴侣或重要他人。|男友/丈夫，或正追求你的男性。感情焦点人物。|男上司、男客户、男性合伙人。关键男性角色。|男性合伙或男性主导的财运。|男性健康议题，或父亲/丈夫的身体。|男老师、男同学。学习上的男性影响。|男性朋友，或社交圈中主导的男性。|参照位置|关注他，他的状态反映你。|忽视他，或将他理想化/妖魔化。|火|红心A|28|被一个具体的人确切地爱——不是模糊的『一个人』，是有名字、有体温、有习惯的那一个",
    "女士|29|len|关键女性、咨询者。牌中的女士，可指代问卜者自己（若是女性），或重要的女性角色。|远离的女性，或她带来的问题。|画像般的女人，聚焦于具体的女性个体。她是你，或她。|女友/妻子，或你正关注的女性对象。|女上司、女客户、女性合伙人。职场上的关键女性。|女性合伙，或由女性主导的财务决策。|女性健康议题，或母亲/妻子的身体。|女老师、女同学。学业上的女性指引。|女性朋友，或圈子中核心的她。|参照位置|关注她，她的态度是镜子。|忽视她的需求或过度依赖。|水|黑桃A|29|被一个具体的人确切地爱——不是模糊的『一个人』，是有名字、有体温、有习惯的那一个",
    "百合|30|len|和平、成熟、长者、性。盛开的百合，散发宁静的香气。代表成熟的爱与平静的生活。|矛盾、不和。和平被打破，或长者带来压力。|高洁的百合花，象征岁月沉淀后的智慧、和平，也暗示感官的满足。|柏拉图、温和长情，或与年长者的恋情。爱情如花香。|资深行业，经验丰富。适合退居幕后或做顾问。|稳健财，财富积累到达成熟期。适合享受而非冒险。|养生，注重保养与内心平和。身心都需慢下来。|经典学习，研究传统学问。像长者请教。|长辈，或有智慧的朋友。社交圈趋于稳定平静。|长期/和睦|宁静致远，享受成熟带来的平静。|过度克制，压抑激情，或感觉老气横秋。|水|黑桃K|30|被像花一样小心地养着——所有的暴风雨都被替着挡，剩下的只有温和的光",
    "太阳|31|len|成功、光明、能量、胜利。金色太阳高照，这是毫无遮蔽的成功与快乐。尽情发光。|失败、被掩盖。光芒被云遮挡，或你的成就不被认可。|散发光热的恒星，象征生命力、成功、认可与正向能量。|公开恋情、被祝福，关系沐浴在阳光下，坦荡而温暖。|事业顶峰，大获成功。站在舞台中央，享受掌声。|大获财，投资回报丰厚，或收入达到高点。|健康强壮，阳气十足。疾病退散。|考试夺魁，学业上的绝对胜利。信心爆棚。|被认可，社交圈的核心，人人都想靠近你这轮太阳。|短期/胜利日|尽情发光，别怕刺眼。这是你的时刻。|过度暴晒，骄傲自满，灼伤身边人。|火|方块A|31|被像太阳一样照着——不必发光也被看见发光，所有的小细节都被夸过一千遍",
    "月亮|32|len|名声、感情、直觉、夜晚。圆月当空，你的感受力与名声被放大。相信直觉，也注意形象。|失声、隐情。名声受损，或直觉被情绪蒙蔽。|柔和的月光，象征感性、声誉、潜意识以及周期性的情绪。|深情、敏感，关系充满浪漫想象和灵魂感。夜晚增进亲密。|获奖、声誉，事业上的名望提升。适合创意、文艺类工作。|名誉收入，因名声带来的财富。也指财务上的直觉。|睡眠/情绪，月亮直接影响内分泌和心情。照顾作息。|文艺创作，想象力丰富。适合诗歌、音乐、文学。|被仰慕，或你仰慕他人。社交受感性支配。|月相周期|相信感受，也管理好情绪周期。月有圆缺。|被情绪困，过度敏感，因外界评价而波动。|水|红心8|32|被一种很安静的喜欢一直照着——不喧哗、不打扰，但每个夜晚抬头都在",
    "钥匙|33|len|关键、答案、成功、打开。金钥匙出现，你有解决问题的能力。门就要打开。|失败、无解。找不到钥匙，问题卡死，或方法错误。|打开一切的门匙，象征解决方案、突破和关键人物。|关系突破，打开对方心防，或找到相处之道。|项目突破，关键难点攻克。找到对的方法。|大笔进账，或找到新的财源。财务的“钥匙”。|根治，找到病根和对的治疗方案。|拿到学位，或解开学习上的关键难题。|关键人脉，那个能为你开门的人出现。|短期/解锁日|找到那把钥匙，别用蛮力。问题有解。|找错地方，白费力气。方向比努力重要。|火|方块8|33|被给一把所有门的钥匙——『你来吧』『任何时候都可以』，那种从此再没有门槛的信任",
    "鱼|34|len|金钱、财富、商业、灵性。游鱼代表流动的财富与丰盛。让钱流动，别抓太紧。|损失、枯竭。财来财去留不住，或源头干涸。|水中自由的鱼，象征金钱、交易、商业机会以及更深层的灵性财富。|物质丰盛的伴侣，或关系因钱而稳固。爱情与面包兼得。|生意人，从事贸易、流通类工作。自己当老板。|现金流，生意上的进账。注重周转。|代谢系统，身体的水液循环。注意肾脏。|商科、金融知识。适合学习与钱相关的学科。|商业朋友，基于利益或共同财富观的圈子。|长期/丰盛期|让财流动，钱是游鱼，不游则死。|过度消费，像鱼一样滑不留手。控制不住花销。|水|方块K|34|被把所有的好都换算成实际的给到手里——『我赚的就是我们的』，那种朴素的全部",
    "锚|35|len|稳定、坚持、职业、根基。船锚沉底，你终于稳下来了。这是长久的安全，而非一时锚定。|不稳、漂泊。锚被拉起，再次动荡，或不想被固定。|深扎海底的锚，象征稳定、坚持、长期的职业与不变的信念。|稳定承诺，关系如锚，给人依靠。不被风浪吹走。|长期职业，考公、编制或在一个岗位深耕。|稳定收入，细水长流。适合储蓄和保守投资。|长期健康，身体进入平稳状态。维持即好。|长期学业，一个需要坚持的学位。|长期朋友，像锚一样的老友，可靠不变。|长期/稳定|稳住，你已找到了港湾。珍惜这份定力。|顽固不化，死守不再适合的环境，不敢起锚。|土|黑桃9|35|被在任何风暴里都不松开手——锚一旦放下就是一辈子，再大的浪也吹不走那条船",
    "十字架|36|len|宿命、重担、痛苦、信仰。十字架压肩，这是你无法逃避的生命课题。担起它，它是你的路。|解脱、卸下负担。苦难结束，你终于放下了。|沉重的十字架，象征宿命般的考验、牺牲与最终的救赎。|宿命之爱，爱得沉重但无法分离。感觉是业力关系。|背锅、压力，工作中承担不该是你的责任。或使命型职业。|经济压力，长期负债或养家重担。但在解决中。|慢性疾病，或长期的康复过程。病苦是十字架。|苦学，为某个艰难目标长期付出。|被议论，背负他人眼光。或社交中感觉被钉住。|长期/磨难期|担起十字，不是受虐，是走过它。意义会浮现。|过度受难，以苦为荣，忘记了还有帮助。|土|梅花6|36|被一起背着十字架——所有重的、痛的、不公的，都不再是一个人的事",
    "灵体|37|len|灵魂、直觉、超自然。发光的灵体，代表精神层面的连接与无形的指引。相信感应。|失联、迷失方向。直觉断线，感到灵性枯竭。|超越物质的能量体，象征高我、天使、祖先或纯粹的灵性能量。|灵魂共鸣，遇到懂你灵魂的人。超越肉体的连接。|身心灵相关行业，心理咨询、疗愈师、占卜师等。|玄学财，通过灵性服务获得收入。|身心灵整体健康，注意能量场清洁。|灵性课程，接触神秘学。向内探索。|有灵性的朋友，可以谈论宇宙和灵魂的人。|长期/灵性|相信感应，你被更高的力量看顾着。|过度玄学，脱离现实，失去接地的生活。|—|—|37|被感知到——不必说话，不必见面，那个心情对方就是知道，那种『我感觉到你了』的奇妙",
    "香炉|38|len|净化、疗愈、消散、氛围。焚香弥漫，净化空间与心灵。扫除负面能量，让清气上升。|污染、沉重。空气浑浊，需要深度清理却未做。|袅袅香烟，象征净化仪式、氛围转换和消散的痛苦。|关系修复，道歉与原谅的仪式。烟消云散，和好如初。|改善工作氛围，调解冲突。或进行空间的整理。|清理坏账，财务上的净化。收债或核销。|身心净化，排毒、断食、芳疗。让身体呼吸。|清空大脑，冥想或整理笔记。适合复习总结。|化解矛盾，做和事佬，或自己从是非中抽身。|短期/净化日|清理空间，让空气流通。净化是日常仪式。|过度净化，或只做表面功夫，不去根源。|风|—|38|被替着扫掉所有不好的东西——那些坏情绪、坏运气、坏念头，被一阵风一样地带走",
    "床|39|len|亲密、休息、私密、婚床。大床舒展，代表亲密的私人空间与深度休憩。该休息了。|不和、分床。亲密关系出现裂痕，或休息不足。|私密的床铺，象征休息、性、亲密关系以及身体最放松的状态。|亲密关系，伴侣间的私密时刻。需要坦诚相见。|需要休息，身体或精神已疲劳。适合请假。|私密支出，如酒店、家具。或与伴侣的共有财产。|睡眠质量直接相关。必须保证休息。|休整，暂停学习以恢复精神。|私密朋友，可睡同一张床的关系。或社交闭关。|短期/休憩期|好好休息，躺在你自己的床上。睡眠是药。|耽溺，赖床不起，或只追求肉体欢愉忽略感情。|土|—|39|被允许真正地放松——不必时刻好看、不必假装精神、不必一直坚强，所有的卸防都被接住",
    "市场|40|len|交易、选择、喧嚣、人多。热闹集市，你身处多样选择与喧闹中。在繁杂中保持清醒。|冷清、无生意。交易难成，选择匮乏。|人来人往的市集，象征交易、社交网络与多样化的选择。|相亲/众多选择，或在感情中比较衡量。别挑花眼。|销售/客户，业绩压力。需要与各种各样的人打交道。|做生意，买卖进出。适合比价、快速成交。|身处人群，注意公共卫生。身心易受嘈杂影响。|多个学科，不知道选哪个。需要筛选信息。|社交场，和不同圈子的人周旋。八面玲珑。|短期/喧嚣期|在繁杂中保持清醒，别被叫卖声迷惑。|被迷乱，选择困难，或匆匆做了交易。|风|—|40|被在人潮里坚定地选——『就算所有的人都站在面前，我也只看见你』"
  ];

  // ==================== 数据解析 ====================
  // 从一段文字中按第一个句号分离出前后两部分
  function splitByFirstPeriod(text) {
    if (!text) return ['', ''];
    const idx = text.indexOf('。');
    if (idx === -1 || idx === text.length - 1) return [text, ''];
    return [text.substring(0, idx + 1), text.substring(idx + 1).trim()];
  }

  function parseLenormandData(rawArr) {
    return rawArr.map(str => {
      const parts = str.split('|');
      if (parts.length < 18) {
        console.warn('雷诺曼牌数据格式错误:', str.substring(0, 20));
        return null;
      }
      // 正位：按句号分离关键词与详细描述
      const upText = parts[3] || '';
      const [up, upDetail] = splitByFirstPeriod(upText);
      // 逆位：按句号分离
      const revText = parts[4] || '';
      const [rev, revDetail] = splitByFirstPeriod(revText);
      // 核心意象字段(p[5])：分离意象描述与核心含义
      const coreText = parts[5] || '';
      const [imagery, core] = splitByFirstPeriod(coreText);
      // 最后字段(p[18])作为一句话浪漫总结
      const phrase = parts[18] || '';

      return {
        name: parts[0] || '',
        num: parts[1] || '',
        suit: parts[2] || '',
        up: up || upText,
        upDetail: upDetail,
        rev: rev || revText,
        revDetail: revDetail,
        imagery: imagery || coreText,
        core: core || coreText,
        love: parts[6] || '',
        career: parts[7] || '',
        money: parts[8] || '',
        health: parts[9] || '',
        study: parts[10] || '',
        social: parts[11] || '',
        time: parts[12] || '',
        advice: parts[13] || '',
        warn: parts[14] || '',
        ele: parts[15] || '',
        astro: parts[16] || '',
        numv: parts[17] || '',
        phrase: phrase
      };
    }).filter(c => c !== null);
  }

  const LENORMAND_CARDS = parseLenormandData(RAW_LENORMAND);

  // ==================== 工具函数 ====================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  // ==================== 牌阵配置 ====================
  const SPREADS = {
    1: { name: '单张', positions: ['当下'] },
    3: { name: '三张', positions: ['过去', '现在', '未来'] },
    5: { name: '五张', positions: ['现状', '挑战', '指引', '环境', '结果'] }
  };

  // ==================== 状态管理 ====================
  const state = {
    activeTab: 'library', // library / reading
    // 牌库状态
    searchKeyword: '',
    selectedCard: null,
    // 占卜状态
    spread: 3,
    drawn: [],
    activeIdx: 0
  };

  // ==================== 本地存储 ====================
  const STORAGE_KEY = 'lenormand_data';

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(reading) {
    try {
      const history = loadHistory();
      history.unshift({
        time: new Date().toISOString(),
        spread: reading.spread,
        cards: reading.cards.map(c => ({
          name: c.card.name,
          position: c.position
        }))
      });
      if (history.length > 20) history.length = 20;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('保存占卜历史失败', e);
    }
  }

  // ==================== 模态框 HTML 结构 ====================
  function getModalHtml() {
    return `
      <div id="lnm-modal" class="lnm-modal">
        <div class="lnm-modal-overlay" onclick="LnmApp.close()"></div>
        <div class="lnm-modal-content">
          <div class="lnm-modal-header">
            <div class="lnm-tabs">
              <button class="lnm-tab ${state.activeTab === 'library' ? 'lnm-tab-active' : ''}" data-tab="library">
                牌库
              </button>
              <button class="lnm-tab ${state.activeTab === 'reading' ? 'lnm-tab-active' : ''}" data-tab="reading">
                占卜
              </button>
            </div>
            <button class="lnm-close-btn" onclick="LnmApp.close()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div id="lnm-content" class="lnm-content"></div>
        </div>
      </div>
    `;
  }

  // ==================== 牌库渲染 ====================
  function renderLibrary() {
    const content = document.getElementById('lnm-content');
    if (!content) return;

    content.innerHTML = `
      <div class="lnm-library">
        <div class="lnm-search">
          <svg class="lnm-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="lnm-search-input" class="lnm-search-input" placeholder="搜索牌名…" value="${escapeHtml(state.searchKeyword)}">
        </div>
        <div class="lnm-deck-info">共 ${LENORMAND_CARDS.length} 张雷诺曼牌</div>
        <div class="lnm-card-grid" id="lnm-card-grid"></div>
      </div>
    `;

    const searchInput = document.getElementById('lnm-search-input');
    if (searchInput) {
      searchInput.oninput = () => {
        state.searchKeyword = searchInput.value;
        renderCardGrid();
      };
    }

    renderCardGrid();
  }

  function renderCardGrid() {
    const grid = document.getElementById('lnm-card-grid');
    if (!grid) return;

    let pool = LENORMAND_CARDS.slice();
    const q = state.searchKeyword.trim().toLowerCase();
    if (q) {
      pool = pool.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.up.toLowerCase().includes(q) ||
        c.core.toLowerCase().includes(q)
      );
    }

    if (!pool.length) {
      grid.innerHTML = `<div class="lnm-empty">没有找到对应的牌</div>`;
      return;
    }

    grid.innerHTML = pool.map(c => `
      <button class="lnm-card-cell" data-name="${escapeHtml(c.name)}">
        <div class="lnm-card-num">${escapeHtml(c.num)}</div>
        <div class="lnm-card-name">${escapeHtml(c.name)}</div>
        <div class="lnm-card-kw">${escapeHtml(c.up.substring(0, 14))}</div>
      </button>
    `).join('');

    grid.querySelectorAll('.lnm-card-cell').forEach(el => {
      el.onclick = () => openCardDetail(el.dataset.name);
    });
  }

  // ==================== 牌详情 ====================
  function openCardDetail(name) {
    const card = LENORMAND_CARDS.find(c => c.name === name);
    if (!card) return;
    state.selectedCard = card;
    renderCardDetail();
  }

  function closeCardDetail() {
    state.selectedCard = null;
    const detail = document.getElementById('lenormand-card-detail');
    if (detail) detail.remove();
  }

  function renderCardDetail() {
    const c = state.selectedCard;
    if (!c) return;

    const oldDetail = document.getElementById('lenormand-card-detail');
    if (oldDetail) oldDetail.remove();

    const modal = document.getElementById('lnm-modal');
    if (!modal) return;

    const detailEl = document.createElement('div');
    detailEl.id = 'lenormand-card-detail';
    detailEl.className = 'lnm-detail-modal';
    detailEl.innerHTML = `
      <div class="lnm-detail-overlay" onclick="LnmApp.closeCardDetail()"></div>
      <div class="lnm-detail-content">
        <div class="lnm-detail-header">
          <button class="lnm-detail-back" onclick="LnmApp.closeCardDetail()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="lnm-detail-title">
            <div class="lnm-detail-subtitle">LENORMAND · ${escapeHtml(c.num)} / 40</div>
            <div class="lnm-detail-name">${escapeHtml(c.name)}</div>
            <div class="lnm-detail-phrase">${escapeHtml(c.phrase)}</div>
          </div>
        </div>
        <div class="lnm-detail-body">
          <div class="lnm-pair-row">
            <div class="lnm-pair-cell">
              <div class="lnm-pair-label">正位 UPRIGHT</div>
              <div class="lnm-pair-value">${escapeHtml(c.up)}</div>
            </div>
            <div class="lnm-pair-cell lnm-pair-dark">
              <div class="lnm-pair-label">挑战 CHALLENGE</div>
              <div class="lnm-pair-value">${escapeHtml(c.rev)}</div>
            </div>
          </div>
          <div class="lnm-attr-row">
            <div class="lnm-attr-cell"><div class="lnm-attr-k">元素</div><div class="lnm-attr-v">${escapeHtml(c.ele)}</div></div>
            <div class="lnm-attr-cell"><div class="lnm-attr-k">对应</div><div class="lnm-attr-v">${escapeHtml(c.astro)}</div></div>
            <div class="lnm-attr-cell"><div class="lnm-attr-k">数字</div><div class="lnm-attr-v">${escapeHtml(c.numv)}</div></div>
          </div>
          <div class="lnm-section">
            <h4>核心</h4>
            <p>${escapeHtml(c.core)}</p>
          </div>
          <div class="lnm-section-grid">
            <div class="lnm-section-cell"><h4>情感</h4><p>${escapeHtml(c.love)}</p></div>
            <div class="lnm-section-cell"><h4>事业</h4><p>${escapeHtml(c.career)}</p></div>
            <div class="lnm-section-cell"><h4>财运</h4><p>${escapeHtml(c.money)}</p></div>
            <div class="lnm-section-cell"><h4>健康</h4><p>${escapeHtml(c.health)}</p></div>
            <div class="lnm-section-cell"><h4>学业</h4><p>${escapeHtml(c.study)}</p></div>
            <div class="lnm-section-cell"><h4>人际</h4><p>${escapeHtml(c.social)}</p></div>
            <div class="lnm-section-cell"><h4>时间</h4><p>${escapeHtml(c.time)}</p></div>
            <div class="lnm-section-cell"><h4>警示</h4><p>${escapeHtml(c.warn)}</p></div>
          </div>
          <div class="lnm-section">
            <h4>建议</h4>
            <p>${escapeHtml(c.advice)}</p>
          </div>
          <div class="lnm-imagery">${escapeHtml(c.imagery)}</div>
        </div>
      </div>
    `;
    modal.appendChild(detailEl);
  }

  // ==================== 占卜渲染 ====================
  function renderReading() {
    const content = document.getElementById('lnm-content');
    if (!content) return;

    const spreadInfo = SPREADS[state.spread] || SPREADS[3];

    content.innerHTML = `
      <div class="lnm-reading">
        <div class="lenormand-config-block">
          <div class="lenormand-config-label">牌阵</div>
          <div class="lenormand-seg" id="lenormand-spread-seg">
            ${Object.entries(SPREADS).map(([k, v]) => `
              <button class="lenormand-seg-btn ${state.spread == k ? 'lenormand-seg-active' : ''}" data-v="${k}">
                ${v.name}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="lenormand-config-hint">
          雷诺曼以正位解读为主，关注牌的核心含义与组合关系
        </div>
        <button class="lnm-draw-btn" id="lnm-draw-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          抽牌
        </button>
        <div class="lnm-spread-area ${state.drawn.length ? '' : 'lenormand-spread-empty'}" id="lnm-spread-area">
          ${state.drawn.length ? '' : '<span class="lenormand-spread-placeholder">选好牌阵后点击抽牌</span>'}
        </div>
        <div class="lnm-interp-list" id="lenormand-interp"></div>
      </div>
    `;

    // 绑定牌阵切换
    content.querySelectorAll('#lenormand-spread-seg button').forEach(btn => {
      btn.onclick = () => {
        state.spread = parseInt(btn.dataset.v);
        state.drawn = [];
        state.activeIdx = 0;
        renderReading();
      };
    });

    // 绑定抽牌按钮
    const drawBtn = document.getElementById('lnm-draw-btn');
    if (drawBtn) {
      drawBtn.onclick = drawCards;
    }

    if (state.drawn.length) {
      renderDrawnCards();
    }
  }

  function drawCards() {
    state.activeIdx = 0;
    const count = state.spread;
    const positions = SPREADS[state.spread]?.positions || [];
    state.drawn = sample(LENORMAND_CARDS, count).map((c, i) => ({
      card: c,
      revealed: false,
      position: positions[i] || `第${i + 1}张`
    }));

    // 保存历史
    saveHistory({
      spread: state.spread,
      cards: state.drawn
    });

    renderDrawnCards();
  }

  function renderDrawnCards() {
    const area = document.getElementById('lnm-spread-area');
    if (!area) return;

    area.classList.remove('lenormand-spread-empty');
    area.innerHTML = state.drawn.map((d, i) => {
      if (!d.revealed) {
        return `
          <div class="lnm-draw-slot lenormand-draw-back" data-i="${i}">
            <div class="lenormand-draw-back-inner">
              <div class="lenormand-draw-pos">${escapeHtml(d.position)}</div>
              <div class="lenormand-draw-hint">点击翻开</div>
            </div>
          </div>
        `;
      }
      const isActive = i === state.activeIdx ? 'lenormand-draw-active' : '';
      return `
        <div class="lnm-draw-slot lenormand-draw-revealed ${isActive}" data-i="${i}">
          <div class="lenormand-draw-num">${escapeHtml(d.card.num)}</div>
          <div class="lenormand-draw-name">${escapeHtml(d.card.name)}</div>
          <div class="lenormand-draw-pos">${escapeHtml(d.position)}</div>
        </div>
      `;
    }).join('');

    area.querySelectorAll('.lnm-draw-slot[data-i]').forEach(el => {
      el.onclick = () => {
        const i = parseInt(el.dataset.i);
        if (!state.drawn[i].revealed) {
          revealCard(i);
        } else {
          state.activeIdx = i;
          renderDrawnCards();
          renderInterpretation();
        }
      };
    });

    renderInterpretation();
  }

  function revealCard(i) {
    state.drawn[i].revealed = true;
    state.activeIdx = i;
    renderDrawnCards();
    renderInterpretation();
  }

  function renderInterpretation() {
    const list = document.getElementById('lenormand-interp');
    if (!list) return;

    const d = state.drawn[state.activeIdx];
    if (!d || !d.revealed) {
      list.innerHTML = '';
      return;
    }

    const c = d.card;

    list.innerHTML = `
      <div class="lnm-interp-item">
        <div class="lenormand-interp-header">
          <span class="lenormand-interp-pos">${escapeHtml(d.position)}</span>
          <h3 class="lenormand-interp-name">${escapeHtml(c.name)}</h3>
        </div>
        <div class="lenormand-interp-body">
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">核心含义</div>
            <div class="lnm-interp-content">${escapeHtml(c.up)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">挑战面</div>
            <div class="lnm-interp-content">${escapeHtml(c.rev)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">核心</div>
            <div class="lnm-interp-content">${escapeHtml(c.core)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">情感</div>
            <div class="lnm-interp-content">${escapeHtml(c.love)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">事业</div>
            <div class="lnm-interp-content">${escapeHtml(c.career)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">建议</div>
            <div class="lnm-interp-content">${escapeHtml(c.advice)}</div>
          </div>
          <div class="lnm-interp-section">
            <div class="lnm-interp-label">警示</div>
            <div class="lnm-interp-content">${escapeHtml(c.warn)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== Tab 切换 ====================
  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.lnm-tab').forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add('lnm-tab-active');
      } else {
        btn.classList.remove('lnm-tab-active');
      }
    });
    closeCardDetail();
    if (tab === 'library') {
      renderLibrary();
    } else {
      renderReading();
    }
  }

  // ==================== 模态框控制 ====================
  function ensureModal() {
    let modal = document.getElementById('lnm-modal');
    if (!modal) {
      const wrap = document.createElement('div');
      wrap.innerHTML = getModalHtml();
      document.body.appendChild(wrap.firstElementChild);
      modal = document.getElementById('lnm-modal');

      modal.querySelectorAll('.lnm-tab').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
      });
    }
    return modal;
  }

  function open() {
    const modal = ensureModal();
    modal.classList.add('lnm-modal-show');
    if (state.activeTab === 'library') {
      renderLibrary();
    } else {
      renderReading();
    }
  }

  function close() {
    const modal = document.getElementById('lnm-modal');
    if (modal) {
      modal.classList.remove('lnm-modal-show');
    }
    closeCardDetail();
  }

  // ==================== 样式注入 ====================
  function injectStyles() {
    if (document.getElementById('lnm-styles')) return;
    const style = document.createElement('style');
    style.id = 'lnm-styles';
    style.textContent = `
      /* 模态框 */
      .lnm-modal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
      }
      .lnm-modal.lnm-modal-show { display: flex; }
      .lnm-modal-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }
      .lnm-modal-content {
        position: relative;
        width: 90%;
        max-width: 480px;
        max-height: 85vh;
        background: #1a1a1a;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid #3a3a3a;
      }
      @media (max-width: 480px) {
        .lnm-modal-content {
          width: 95%;
          max-height: 90vh;
        }
      }

      /* 头部 */
      .lnm-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #111;
        color: #f0f0f0;
        flex-shrink: 0;
        border-bottom: 1px solid #3a3a3a;
      }
      .lnm-tabs {
        display: flex;
        gap: 4px;
        background: #222;
        border-radius: 8px;
        padding: 3px;
      }
      .lnm-tab {
        padding: 6px 18px;
        border: none;
        background: transparent;
        color: #999;
        font-size: 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lnm-tab-active {
        background: #333;
        color: #f0f0f0;
        font-weight: 500;
      }
      .lnm-close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: #222;
        color: #ccc;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .lnm-close-btn:hover { background: #333; color: #fff; }

      /* 内容区 */
      .lnm-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      /* 牌库 - 搜索 */
      .lnm-search {
        position: relative;
        margin-bottom: 10px;
      }
      .lnm-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
      }
      .lnm-search-input {
        width: 100%;
        padding: 10px 12px 10px 36px;
        border: 1px solid #444;
        border-radius: 10px;
        font-size: 14px;
        background: #222;
        color: #e0e0e0;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
      }
      .lnm-search-input:focus { border-color: #666; }
      .lnm-search-input::placeholder { color: #666; }

      .lnm-deck-info {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }

      /* 牌网格 */
      .lnm-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
      }
      .lnm-card-cell {
        background: #2a2a2a;
        border: 1px solid #3a3a3a;
        border-radius: 10px;
        padding: 12px 8px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .lnm-card-cell:hover {
        border-color: #666;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .lnm-card-num {
        font-size: 11px;
        color: #666;
      }
      .lnm-card-name {
        font-size: 14px;
        font-weight: 500;
        color: #e0e0e0;
      }
      .lnm-card-kw {
        font-size: 11px;
        color: #888;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      .lnm-empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 0;
        color: #666;
        font-size: 14px;
      }

      /* 牌详情弹窗 */
      .lnm-detail-modal {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lnm-detail-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.6);
      }
      .lnm-detail-content {
        position: relative;
        width: 92%;
        max-height: 80%;
        background: #1a1a1a;
        border-radius: 14px;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid #3a3a3a;
      }
      .lnm-detail-header {
        position: sticky;
        top: 0;
        background: #111;
        color: #f0f0f0;
        padding: 14px 16px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        border-bottom: 1px solid #3a3a3a;
      }
      .lnm-detail-back {
        width: 32px;
        height: 32px;
        border: none;
        background: #222;
        color: #ccc;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .lnm-detail-back:hover { background: #333; }
      .lnm-detail-title { flex: 1; }
      .lnm-detail-subtitle {
        font-size: 11px;
        color: #888;
        margin-bottom: 2px;
        letter-spacing: 1px;
      }
      .lnm-detail-name {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #f0f0f0;
      }
      .lnm-detail-phrase {
        font-size: 12px;
        color: #999;
        font-style: italic;
      }
      .lnm-detail-body { padding: 16px; }

      .lnm-pair-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }
      .lnm-pair-cell {
        background: #2a2a2a;
        border-radius: 10px;
        padding: 12px;
        border: 1px solid #3a3a3a;
      }
      .lnm-pair-dark {
        background: #111;
        border-color: #333;
      }
      .lnm-pair-label {
        font-size: 10px;
        color: #666;
        margin-bottom: 6px;
        letter-spacing: 1px;
      }
      .lnm-pair-value {
        font-size: 13px;
        line-height: 1.5;
        color: #e0e0e0;
      }

      .lnm-attr-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 14px;
      }
      .lnm-attr-cell {
        background: #222;
        border-radius: 8px;
        padding: 8px;
        text-align: center;
      }
      .lnm-attr-k {
        font-size: 11px;
        color: #666;
        margin-bottom: 2px;
      }
      .lnm-attr-v {
        font-size: 13px;
        color: #e0e0e0;
        font-weight: 500;
      }

      .lnm-section {
        background: #2a2a2a;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 10px;
        border: 1px solid #3a3a3a;
      }
      .lnm-section h4 {
        margin: 0 0 6px 0;
        font-size: 13px;
        color: #e0e0e0;
        font-weight: 600;
      }
      .lnm-section p {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: #bbb;
      }

      .lnm-section-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .lnm-section-cell {
        background: #2a2a2a;
        border-radius: 8px;
        padding: 10px 12px;
        border: 1px solid #3a3a3a;
      }
      .lnm-section-cell h4 {
        margin: 0 0 4px 0;
        font-size: 12px;
        color: #e0e0e0;
        font-weight: 600;
      }
      .lnm-section-cell p {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
        color: #999;
      }

      .lnm-imagery {
        background: #222;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 12px;
        line-height: 1.6;
        color: #888;
        font-style: italic;
        margin-top: 10px;
        border: 1px solid #333;
      }

      /* 占卜 */
      .lenormand-config-block {
        margin-bottom: 14px;
      }
      .lenormand-config-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
      }
      .lenormand-seg {
        display: flex;
        background: #222;
        border-radius: 10px;
        padding: 4px;
        gap: 2px;
      }
      .lenormand-seg-btn {
        flex: 1;
        padding: 8px 0;
        border: none;
        background: transparent;
        color: #888;
        font-size: 13px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lenormand-seg-active {
        background: #333;
        color: #f0f0f0;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .lenormand-config-hint {
        font-size: 12px;
        color: #555;
        margin-bottom: 14px;
        font-style: italic;
      }

      .lnm-draw-btn {
        width: 100%;
        padding: 14px;
        border: none;
        background: #333;
        color: #ccc;
        font-size: 16px;
        font-weight: 500;
        border-radius: 12px;
        cursor: pointer;
        margin-bottom: 18px;
        transition: all 0.2s;
      }
      .lnm-draw-btn:hover {
        background: #444;
        color: #fff;
      }
      .lnm-draw-btn:active { background: #555; }

      /* 牌阵区域 */
      .lnm-spread-area {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        padding: 16px 0;
        margin-bottom: 16px;
      }
      .lenormand-spread-empty {
        min-height: 120px;
        align-items: center;
      }
      .lenormand-spread-placeholder {
        color: #555;
        font-size: 13px;
      }
      .lnm-draw-slot {
        width: 80px;
        min-height: 120px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        padding: 8px 6px;
        text-align: center;
      }
      .lenormand-draw-back {
        background: #111;
        color: #888;
        border: 2px solid #444;
      }
      .lenormand-draw-back:hover {
        transform: translateY(-3px) scale(1.03);
        border-color: #666;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      }
      .lenormand-draw-back-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .lenormand-draw-pos {
        font-size: 11px;
        font-weight: 500;
      }
      .lenormand-draw-hint {
        font-size: 10px;
        opacity: 0.7;
      }
      .lenormand-draw-revealed {
        background: #2a2a2a;
        border: 2px solid #444;
        color: #e0e0e0;
      }
      .lenormand-draw-active {
        border-color: #e0e0e0;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
      }
      .lenormand-draw-num {
        font-size: 10px;
        color: #888;
        margin-bottom: 4px;
      }
      .lenormand-draw-name {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      /* 解读 */
      .lnm-interp-list { margin-top: 8px; }
      .lnm-interp-item {
        background: #2a2a2a;
        border-radius: 12px;
        border: 1px solid #3a3a3a;
        overflow: hidden;
      }
      .lenormand-interp-header {
        background: #222;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        border-bottom: 1px solid #3a3a3a;
      }
      .lenormand-interp-pos {
        background: #555;
        color: #f0f0f0;
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 12px;
      }
      .lenormand-interp-name {
        margin: 0;
        font-size: 16px;
        color: #f0f0f0;
        font-weight: 600;
      }
      .lenormand-interp-body { padding: 12px 16px; }
      .lnm-interp-section {
        padding: 10px 0;
        border-bottom: 1px solid #333;
      }
      .lnm-interp-section:last-child { border-bottom: none; }
      .lnm-interp-label {
        font-size: 12px;
        color: #888;
        margin-bottom: 4px;
        font-weight: 500;
      }
      .lnm-interp-content {
        font-size: 13px;
        line-height: 1.6;
        color: #ccc;
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== 初始化 ====================
  function init() {
    injectStyles();
  }

  // ==================== 暴露 API ====================
  window.LnmApp = {
    open,
    close,
    closeCardDetail,
    init,
    get cards() { return LENORMAND_CARDS; },
    get history() { return loadHistory(); }
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
