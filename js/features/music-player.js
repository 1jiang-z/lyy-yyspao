/* 悬浮音乐播放器功能 */
        window.initMusicPlayer = async function initMusicPlayer() {
    const latestSystemSongs = [{
                title: "虚拟", sub: "你是我朝夕相伴触手可及的虚拟", url: "https://files.catbox.moe/6s65mp.mp3"
            },
                {
                    title: "多远都要在一起", sub: "爱能克服远距离", url: "https://files.catbox.moe/06k9ra.mp3"
                },
                {
                    title: "永不失联的爱", sub: "这一辈子都不想失联的爱", url: "https://files.catbox.moe/uvucav.mp3"
                },
                {
                    title: "稳稳的幸福", sub: "这是我想要的幸福", url: "https://files.catbox.moe/inb22a.mp3"
                },
                {
                    title: "有我呢", sub: "我会让你习惯 多一个人陪伴", url: "https://files.catbox.moe/hrazjt"
                },
                {
                    title: "一千零一夜", sub: "梦里能到达的地方啊 有一天脚步也能到达", url: "https://files.catbox.moe/syfuon.mp3"
                },
                {
                    title: "月亮与六便士", sub: "我的世界由你建立 因你崩塌", url: "https://files.catbox.moe/98quqc.mp3"
                },
                {
                    title: "次元恋人", sub: "约好了隔着次元也吻住泪眼", url: "https://files.catbox.moe/5u5dy0.mp3"
                },
                {
                    title: "阳光下的星星", sub: "如果爱上你只是一个梦境", url: "https://files.catbox.moe/dxgqsk.mp3"
                },
                {
                    title: "周边", sub: "灵魂里空缺的那段", url: "https://files.catbox.moe/a7k5wd.mp3"
                },
                {
                    title: "恋爱ing", sub: "让我重新认识L O V E", url: "https://files.catbox.moe/94slcd.mp3"
                },
                {
                    title: "一点一滴", sub: "你让爱一点一滴汇成河", url: "https://files.catbox.moe/958qzg.mp3"
                },
                {
                    title: "关键词", sub: "让我见识爱情可以慷慨又自私", url: "https://files.catbox.moe/9yl5ic.mp3"
                },
                {
                    title: "想见你想见你想见你", sub: "穿越了千个万个时间线里人海里相依", url: "https://files.catbox.moe/co58d7.mp3"
                },
                {
                    title: "star crossing night", sub: "这里没有你", url: "https://files.catbox.moe/i3f86b.mp3"
                },
                {
                    title: "sea temple", sub: "If we have each other", url: "https://files.catbox.moe/c57gxs.mp3"
                },
                {
                    title: "我想要占据你", sub: "占据你的⼀切且无可厚非", url: "https://files.catbox.moe/1fp6eg.mp3"
                },
                {
                    title: "特别的人", sub: "我们是对方特别的人", url: "https://files.catbox.moe/a0n0l7.mp3"
                },
                {
                    title: "麦恩莉", sub: "在广阔寂寞漩涡解脱", url: "https://files.catbox.moe/2inae2.mp3"
                },
                {
                    title: "会呼吸的痛", sub: "想念是会呼吸的痛", url: "https://files.catbox.moe/0uhmxr.mp3"
                },
                {
                    title: "一生的爱", sub: "我只想要给你我一生的爱", url: "https://files.catbox.moe/f0e93c.mp3"
                },
                {
                    title: "身骑白马", sub: "追赶要我爱的不保留", url: "https://files.catbox.moe/iywfe2.mp3"
                },
                {
                    title: "爱情讯息", sub: "想念变成空气在叹息", url: "https://files.catbox.moe/4dl0t2.mp3"
                },
                {
                    title: "你在 不在", sub: "你在我心里面 陪我失眠", url: "https://files.catbox.moe/povyqa.mp3"
                },
                {
                    title: "你是我的风景", sub: "爱让悬崖变平地", url: "https://files.catbox.moe/fnwtf8.mp3"
                },
                {
                    title: "life with u", sub: "Now I know that you're the one", url: "https://files.catbox.moe/zqfxvd.mp3"
                },
                {
                    title: "勾指起誓", sub: "你是理所当然的奇迹", url: "https://files.catbox.moe/4spgo5.mp3"
                },
                {
                    title: "牵一半", sub: "你的存在是我唯一依赖", url: "https://files.catbox.moe/bk21gu.mp3"
                },
                {
                    title: "rove", sub: "Oh we are in the War of Love on Rove", url: "https://files.catbox.moe/sfwsuk.mp3"
                },
                {
                    title: "唯一", sub: "我真的爱你 句句不轻易", url: "https://files.catbox.moe/69g4fe.mp3"
                },
            { title: "致爱 Your Song", sub: "我只想每个落日 身边都有你", url: "https://files.catbox.moe/01bmnf.mp3" },
            { title: "一首想不通的古风", sub: "画地为牢 画命为符 铸成下一世坚守", url: "https://files.catbox.moe/9b4lh7.mp3" },
            { title: "茉莉雨", sub: "琴声里愁几许关于你", url: "https://files.catbox.moe/7ml83u.mp3" },
            { title: "怎么唱情歌", sub: "海 变的苦涩 灼伤一片温柔", url: "https://files.catbox.moe/isqax9.mp3" },
            { title: "岸边客", sub: "你回来我心未改 你不在我还等待", url: "https://files.catbox.moe/9oud6s.mp3" },
            { title: "江南雪", sub: "相思再无药解 从此万般风月都是我心结", url: "https://files.catbox.moe/hhjwek.mp3" },
            { title: "不死之身", sub: "我仍爱你爱得不知天高地厚", url: "https://files.catbox.moe/g960ev.mp3" },
            { title: "我们的明天", sub: "爱从不曾保留 才勇敢了我", url: "https://files.catbox.moe/a3yjvv.mp3" },
            { title: "难解", sub: "点炷高香敬予神明 被人嘲笑矢志不渝", url: "https://files.catbox.moe/1u8m3r.mp3" },
            { title: "最好的我 & 50 Feet", sub: "试着伸手 却连你的影子我都无法靠近", url: "https://files.catbox.moe/clsiyi.mp3" },
            { title: "同手同脚", sub: "也是存在在这个世界 唯一的唯一", url: "https://files.catbox.moe/b8hss3.mp3" },
            { title: "同花顺", sub: "只要肯爱得深 是不是就有这可能", url: "https://files.catbox.moe/28mw5d.mp3" },
            { title: "轻舞", sub: "轻舞吧 过往如裙纱", url: "https://files.catbox.moe/8n9lhi.mp3" },
            { title: "绝对占有 相对自由", sub: "赞美你包容你都是我的使命", url: "https://files.catbox.moe/zi4gxo.mp3" },
            { title: "千万次想象", sub: "我千万次想象 千万次模仿 思念的形状", url: "https://files.catbox.moe/4jtex8.mp3" },
            { title: "辞家千里", sub: "穿过无人问津去见山海万顷", url: "https://files.catbox.moe/2quy44.mp3" },
            { title: "Ryukyuvania", sub: "----", url: "https://files.catbox.moe/utmbqp.mp3" },
            { title: "沦陷", sub: "圈它在黑暗中逃不出的梦魇", url: "https://files.catbox.moe/0bhl3i.mp3" },
            { title: "晚枫歌", sub: "你又怎知我从未放手", url: "https://files.catbox.moe/xhwrwy.mp3" },
            { title: "I Need U", sub: "I need you girl", url: "https://files.catbox.moe/v1k4h8.mp3" },
            { title: "若梦", sub: "日升月落 此生依旧难舍", url: "https://files.catbox.moe/6uysqy.mp3" },
            { title: "爱人", sub: "可是恨的人没死成 爱的人没可能", url: "https://files.catbox.moe/wtbdxe.mp3" },
            { title: "星河叹", sub: "我盼孤身纵马 笛声漫天 四海任我游", url: "https://files.catbox.moe/de7g2m.mp3" },
            { title: "爱殇", sub: "假欢畅 又何妨 无人共享", url: "https://files.catbox.moe/or2hm7.mp3" },
            { title: "Una mattina", sub: "----", url: "https://files.catbox.moe/nf8o90.mp3" },
            { title: "顺其自然", sub: "You light up my heart", url: "https://files.catbox.moe/na01cn.mp3" },
            { title: "初见", sub: "若如初见 为谁而归", url: "https://files.catbox.moe/bumolx.mp3" },
            { title: "我好像在哪见过你", sub: "人们把难言的爱都埋入土壤里", url: "https://files.catbox.moe/vcidpc.mp3" },
            { title: "别回头", sub: "爱是年少时不堪其重 渗透灵魂的一阵剧痛", url: "https://files.catbox.moe/h1hwo5.mp3" },
            { title: "大鱼", sub: "怕你飞远去 怕你离我而去", url: "https://files.catbox.moe/jlcvkg.mp3" },
            { title: "人鱼的眼泪", sub: "Baby Don't cry", url: "https://files.catbox.moe/40fm4j.mp3" },
            { title: "九张机", sub: "我愿化作望断天涯那一方青石", url: "https://files.catbox.moe/hql6w5.mp3" },
            { title: "梦幻诛仙", sub: "来世若再会还与你双双对对", url: "https://files.catbox.moe/r6btwp.mp3" },
            { title: "寻常歌", sub: "所幸不过是 寻常人间事", url: "https://files.catbox.moe/ntcqvr.mp3" },
{ title: "公示情书", sub: "有种微妙确定的幸福 叫对方正在输入", url: "https://files.catbox.moe/rptwer.mp3" },
{ title: "现在那边是几点", sub: "请问你现在那边是几点 会不会还放有我的照片", url: "https://files.catbox.moe/icv2aa.mp3" },
{ title: "情人", sub: "气氛开始升温 危险又迷人", url: "https://files.catbox.moe/iqairg.mp3" },
{ title: "怜悯", sub: "我要带着爱意着恨你", url: "https://files.catbox.moe/242a1h.mp3" },
{ title: "疑心病", sub: "你终于说出口你对我感情也很重", url: "https://files.catbox.moe/jc1umm.mp3" },
{ title: "诀爱", sub: "若灵魂相结在天地之间", url: "https://files.catbox.moe/quqaws.mp3" },
{ title: "彼岸", sub: "她捧起镜花水月 一刹那湮灭", url: "https://files.catbox.moe/zxepep.mp3" },
{ title: "问情", sub: "当爱恨如潮生多残忍", url: "https://files.catbox.moe/erds0n.mp3" },
{ title: "同进退", sub: "我会牵着你手同进退 佛前立誓不后悔", url: "https://files.catbox.moe/vb6chf.mp3" },
{ title: "招摇", sub: "一句此生不换", url: "https://files.catbox.moe/oc86ih.mp3" },
{ title: "你要的全拿走", sub: "好聚好散听着也楚楚可怜", url: "https://files.catbox.moe/ok2e3s.mp3" },
{ title: "云裳羽衣曲", sub: "故事鲜艳而缘分却太浅", url: "https://files.catbox.moe/njnbhv.mp3" },
{ title: "大梦归离", sub: "终于听风儿说 知道你在哪里", url: "https://files.catbox.moe/5z67vs.mp3" },
{ title: "偏向", sub: "为何会两败俱伤", url: "https://files.catbox.moe/i37f39.mp3" },
{ title: "Love me like you do", sub: "You're the only thing I wanna touch", url: "https://files.catbox.moe/arym0i.mp3" },
{ title: "Not snow,but U", sub: "我期待的不是雪而是有你的冬天", url: "https://files.catbox.moe/6rk4gw.mp3" },
{ title: "The Evergreen", sub: "我恍然明了我所需的一切已尽数摆在眼前", url: "https://files.catbox.moe/ca3rim.mp3" },
{ title: "冥河螺旋", sub: "我如此希望 我伴你左右", url: "https://files.catbox.moe/xtj8db.mp3" },
{ title: "熄灭", sub: "你总问我在一起会不会感到厌倦", url: "https://files.catbox.moe/wnzxou.mp3" },
{ title: "爱人错过", sub: "我肯定在几百年前就说过爱你", url: "https://files.catbox.moe/q2nx16.mp3" },
{ title: "我想念", sub: "我想念你说过的那种永远", url: "https://files.catbox.moe/3qxads.mp3" },
{ title: "此生不换", sub: "再有一万年深情也不变", url: "https://files.catbox.moe/72ik88.mp3" },
{ title: "鳥の詩", sub: "----", url: "https://files.catbox.moe/966u00.mp3" }

    ];

    const uploadCoverBtn = document.getElementById('upload-cover-btn');
    const coverInput = document.getElementById('cover-input');
    const vinylRecord = document.getElementById('vinyl-record-visual');

    const applyPlayerCover = (base64Data) => {
        if (base64Data) {
            vinylRecord.style.backgroundImage = `url(${base64Data})`;
            vinylRecord.style.backgroundSize = 'cover';
            vinylRecord.style.backgroundPosition = 'center';
            vinylRecord.style.backgroundColor = 'transparent';
            vinylRecord.classList.add('has-cover');
            vinylRecord.style.borderWidth = '1px';
        } else {
            vinylRecord.style.backgroundImage = '';
            vinylRecord.style.backgroundColor = '';
            vinylRecord.classList.remove('has-cover');
            vinylRecord.style.borderWidth = '2px';
        }
    };

const savedCover = safeGetItem(APP_PREFIX + 'playerCover');

    localforage.getItem(APP_PREFIX + 'playerCover').then(cover => { if(cover) applyPlayerCover(cover); });
    if (savedCover) applyPlayerCover(savedCover);

    uploadCoverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (vinylRecord.classList.contains('has-cover')) {
            if (confirm('想要重置回默认的【主题色黑胶】样式吗？\n\n• 点击【确定】恢复默认\n• 点击【取消】选择新图片')) {
                localforage.removeItem(APP_PREFIX + 'playerCover');
                applyPlayerCover(null);
                showNotification('已恢复默认黑胶样式', 'success');
                return;
            }
        }
        coverInput.click();
    });

    coverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showNotification('图片太大了，请上传 2MB 以内的图片', 'error');
            return;
        }
        cropImageToSquare(file, 200).then(base64Data => {
            try {
                localforage.setItem(APP_PREFIX + 'playerCover', base64Data);
                applyPlayerCover(base64Data);
                showNotification('专辑封面设置成功！', 'success');
            } catch (err) {
                console.error(err);
                showNotification('图片存储失败（可能超出了浏览器限制）', 'error');
            }
        }).catch(() => {
            showNotification('图片处理失败，请重试', 'error');
        });
        e.target.value = '';
    });
// 在 initMusicPlayer 函数内部，找到变量声明区域（约在 let songs = [] 附近），添加以下代码：

// 搜索相关状态
let searchResults = [];           // 搜索结果
let isSearchingOnline = false;    // 是否正在搜索在线歌曲
let searchDebounceTimer = null;   // 搜索防抖
    let songs = [];
    try {
        const savedSongs = await localforage.getItem(APP_PREFIX + 'customSongs');
        if (savedSongs && Array.isArray(savedSongs) && savedSongs.length > 0) {
            songs = savedSongs;
        } else if (savedSongs && typeof savedSongs === 'string') {
            songs = JSON.parse(savedSongs);
            await localforage.setItem(APP_PREFIX + 'customSongs', songs);
        } else {
            const legacyStr = safeGetItem(APP_PREFIX + 'customSongs');
            if (legacyStr) {
                try {
                    songs = JSON.parse(legacyStr);
                    await localforage.setItem(APP_PREFIX + 'customSongs', songs);
                    safeRemoveItem(APP_PREFIX + 'customSongs');
                } catch(e) {
                    songs = [...latestSystemSongs];
                }
            } else {
                songs = [...latestSystemSongs];
            }
        }
    } catch(e) {
        console.error('加载歌单失败，使用默认歌单', e);
        songs = [...latestSystemSongs];
    }

    const player = document.getElementById('player');
    const miniView = document.getElementById('mini-view');
    const playlist = document.getElementById('playlist');
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('play-btn');
    const progressArea = document.getElementById('progress-area');

    // 确保悬浮球在最顶层
    if (player) player.style.zIndex = '2147483647';
    if (playlist) playlist.style.zIndex = '2147483646';

    const addSongModal = document.getElementById('add-song-modal');
    const newSongTitle = document.getElementById('new-song-title');
    const newSongSub = document.getElementById('new-song-sub');
    const newSongUrl = document.getElementById('new-song-url');
    const confirmAddSongBtn = document.getElementById('confirm-add-song');
    const cancelAddSongBtn = document.getElementById('cancel-add-song');
    const modalTitleElem = addSongModal.querySelector('.modal-title span');

    let currentIndex = 0;
    let isPlaying = false;
    let playMode = 'sequence';
    let editModeIndex = -1;
    let searchTerm = '';
    let isSearchVisible = false;

    // 极短静音音频，用于在用户点击的同步回调里解锁安卓播放权限
    const SILENT_SRC = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQcAQNHWpXYRAPv/+/sA';

    function loadSong(index) {
        if (songs.length === 0) return;
        if (index >= songs.length) index = 0;
        if (index < 0) index = songs.length - 1;

        const song = songs[index];
        document.getElementById('music-title').innerText = song.title;
        document.getElementById('music-subtitle').innerText = song.sub;
        
        if (song.url) audio.src = song.url;
        updatePlaylistHighlight();
    }

    // 播放当前歌曲（有URL直接播，没URL先获取再播，兼容安卓）
    function playCurrent() {
        const song = songs[currentIndex];
        if (!song) return;

        // 有URL：直接播放
        if (song.url) {
            audio.src = song.url;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    document.getElementById('icon-play').style.display = 'none';
                    document.getElementById('icon-pause').style.display = 'block';
                    player.classList.add('playing');
                }).catch(error => {
                    console.error(error);
                    showNotification('播放失败，请检查网络或链接是否有效', 'error');
                });
            } else {
                isPlaying = true;
                document.getElementById('icon-play').style.display = 'none';
                document.getElementById('icon-pause').style.display = 'block';
                player.classList.add('playing');
            }
            return;
        }

        // 没URL但有ID：先播静音占坑（满足安卓"必须在用户点击时播放"的要求），再拿URL
        if (song.id) {
            // 显示播放状态
            isPlaying = true;
            document.getElementById('icon-play').style.display = 'none';
            document.getElementById('icon-pause').style.display = 'block';
            player.classList.add('playing');

            // 关键：在用户点击的同步回调里立刻播静音，解锁安卓播放权限
            audio.src = SILENT_SRC;
            audio.volume = 0;
            audio.play().catch(() => {});

            // 异步拿真正的URL
            showNotification('正在获取播放链接...', 'info');
            getSongUrl(song.id).then(function(url) {
                if (url) {
                    song.url = url;
                    savePlaylist();
                    // 换成真正的歌
                    audio.volume = 1;
                    audio.src = url;
                    audio.play().catch(() => {});
                } else {
                    showNotification('无法获取播放链接', 'error');
                    audio.pause();
                    isPlaying = false;
                    document.getElementById('icon-play').style.display = 'block';
                    document.getElementById('icon-pause').style.display = 'none';
                    player.classList.remove('playing');
                }
            }).catch(function() {
                showNotification('获取播放链接失败', 'error');
                audio.pause();
                isPlaying = false;
                document.getElementById('icon-play').style.display = 'block';
                document.getElementById('icon-pause').style.display = 'none';
                player.classList.remove('playing');
            });
        }
    }

    function togglePlay() {
        if (songs.length === 0) {
            showNotification('播放列表为空', 'warning');
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            document.getElementById('icon-play').style.display = 'block';
            document.getElementById('icon-pause').style.display = 'none';
            player.classList.remove('playing');
        } else {
            playCurrent();
        }
    }

    function nextSong() {
        if (songs.length === 0) return;
        if (playMode === 'single') { currentIndex = currentIndex; }
        else if (playMode === 'shuffle') currentIndex = Math.floor(Math.random() * songs.length);
        else currentIndex = (currentIndex + 1) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) playCurrent();
    }

    function prevSong() {
        if (songs.length === 0) return;
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) playCurrent();
    }

    function savePlaylist() {
        localforage.setItem(APP_PREFIX + 'customSongs', songs).catch(e => {
            console.error('歌单保存失败', e);
            showNotification('歌单保存失败，存储空间可能已满', 'error');
        });
        renderPlaylist();
    }

    function openEditModal(index) {
        const song = songs[index];
        if (!song) return;
        editModeIndex = index;
        newSongTitle.value = song.title;
        newSongSub.value = song.sub;
        newSongUrl.value = song.url;
        modalTitleElem.innerText = "编辑歌曲信息";
        confirmAddSongBtn.innerText = "保存修改";
        showModal(addSongModal);
    }

    function openAddModal() {
        editModeIndex = -1;
        newSongTitle.value = '';
        newSongSub.value = '';
        newSongUrl.value = '';
        modalTitleElem.innerText = "添加自定义歌曲";
        confirmAddSongBtn.innerText = "添加播放";
        showModal(addSongModal);
    }

    function renderPlaylist() {
        playlist.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'playlist-header';
        header.innerHTML = `
    <div class="pl-header-title">˙°ʚᕱ⑅ᕱɞ°˙</div>
    <div class="pl-header-actions">
        <button class="pl-icon-btn" id="pl-manage-btn" title="歌单管理"><i class="fas fa-folder-open"></i></button>
        <button class="pl-icon-btn ${isSearchVisible ? 'active' : ''}" id="pl-search-toggle" title="搜索"><i class="fas fa-search"></i></button>
        <button class="pl-icon-btn" id="pl-add-btn" title="添加歌曲"><i class="fas fa-plus"></i></button>
    </div>
    <input type="file" id="pl-import-input" accept=".json" style="display:none">
`;
        playlist.appendChild(header);

        const searchWrapper = document.createElement('div');
        searchWrapper.className = `playlist-search-wrapper ${isSearchVisible ? 'active' : ''}`;
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'playlist-search-input';
        searchInput.placeholder = '';
        searchInput.value = searchTerm;
        
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderListContent(contentDiv);
        });
        
        searchWrapper.appendChild(searchInput);
        playlist.appendChild(searchWrapper);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'playlist-content';
        playlist.appendChild(contentDiv);

        renderListContent(contentDiv);

        header.querySelector('#pl-add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openAddModal();
            newSongTitle.focus();
        });
        header.querySelector('#pl-manage-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
            overlay.innerHTML = `
                <div style="background:var(--secondary-bg);border-radius:16px;padding:20px;width:280px;box-shadow:0 10px 40px rgba(0,0,0,0.3);border:1px solid var(--border-color);display:flex;flex-direction:column;gap:12px;">
                    <div style="text-align:center;font-weight:600;margin-bottom:5px;">歌单管理</div>
                    
                    <button id="_pl_opt_import" style="padding:12px;border-radius:10px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-primary);cursor:pointer;display:flex;align-items:center;gap:10px;font-size:14px;transition:0.2s;">
                        <div style="width:32px;height:32px;background:rgba(var(--accent-color-rgb),0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--accent-color);"><i class="fas fa-file-import"></i></div>
                        导入歌单文件
                    </button>
                 <button id="_pl_opt_search" style="padding:12px;border-radius:10px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-primary);cursor:pointer;display:flex;align-items:center;gap:10px;font-size:14px;transition:0.2s;">
    <div style="width:32px;height:32px;background:rgba(var(--accent-color-rgb),0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--accent-color);"><i class="fas fa-search"></i></div>
    在线搜索歌曲
</button>
                    <button id="_pl_opt_export" style="padding:12px;border-radius:10px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-primary);cursor:pointer;display:flex;align-items:center;gap:10px;font-size:14px;transition:0.2s;">
                        <div style="width:32px;height:32px;background:rgba(var(--accent-color-rgb),0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--accent-color);"><i class="fas fa-file-export"></i></div>
                        导出当前歌单
                    </button>
                    
                    <button id="_pl_opt_cancel" style="padding:10px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;margin-top:5px;">取消</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const closeOpt = () => overlay.remove();
            overlay.addEventListener('click', (ev) => { if(ev.target === overlay) closeOpt(); });
            document.getElementById('_pl_opt_cancel').onclick = closeOpt;

            document.getElementById('_pl_opt_export').onclick = () => {
                closeOpt();
                if (songs.length === 0) {
                    showNotification('歌单为空，无法导出', 'warning');
                    return;
                }
                const dataStr = JSON.stringify(songs, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `music-playlist-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showNotification('歌单导出成功', 'success');
            };
// 在 document.getElementById('_pl_opt_export').onclick 之后添加：

document.getElementById('_pl_opt_search').onclick = () => {
    closeOpt();
    showOnlineSearchDialog();
};
            document.getElementById('_pl_opt_import').onclick = () => {
                closeOpt();
                const input = header.querySelector('#pl-import-input');
                if (input) input.click();
            };
        });
        header.querySelector('#pl-import-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const importedSongs = JSON.parse(ev.target.result);
                    if (!Array.isArray(importedSongs)) throw new Error('格式错误');
                    
                    if (confirm(`检测到 ${importedSongs.length} 首歌曲。\n点击【确定】覆盖当前歌单\n点击【取消】追加到当前歌单末尾`)) {
                        songs = importedSongs;
                        showNotification('歌单已覆盖', 'success');
                    } else {
                        songs = [...songs, ...importedSongs];
                        showNotification(`已追加 ${importedSongs.length} 首歌曲`, 'success');
                    }
                    
                    savePlaylist();
                    if (songs.length > 0 && currentIndex >= songs.length) {
                        currentIndex = 0;
                        loadSong(0);
                    }
                } catch (err) {
                    console.error(err);
                    showNotification('导入失败：文件格式不正确', 'error');
                }
            };
            reader.readAsText(file);
            e.target.value = ''; 
        });
        header.querySelector('#pl-search-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            isSearchVisible = !isSearchVisible;
            searchWrapper.classList.toggle('active', isSearchVisible);
            e.currentTarget.classList.toggle('active', isSearchVisible);
            if (isSearchVisible) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    function renderListContent(container) {
        container.innerHTML = '';
        
        const filteredSongs = songs.map((s, i) => ({...s, originalIndex: i}))
                                   .filter(s => s.title.toLowerCase().includes(searchTerm) || 
                                                s.sub.toLowerCase().includes(searchTerm));

        if (filteredSongs.length === 0) {
            container.innerHTML = `<div class="empty-search-result">未找到 "${searchTerm}" 相关歌曲</div>`;
            return;
        }

        filteredSongs.forEach((song) => {
            const realIndex = song.originalIndex;

            const div = document.createElement('div');
            div.className = 'playlist-item';
            if (realIndex === currentIndex) div.classList.add('playing');

            const highlightText = (text, term) => {
                if (!term) return text;
                const regex = new RegExp(`(${term})`, 'gi');
                return text.replace(regex, '<span class="highlight">$1</span>');
            };

            const displayTitle = highlightText(song.title, searchTerm);
            const displaySub = highlightText(song.sub, searchTerm);

            div.innerHTML = `
                <div class="song-info">
                    <div class="song-title-row">${displayTitle}</div>
                    <div class="song-sub-row">${displaySub}</div>
                </div>
                <div class="item-actions">
                    ${song.isCustom ? '<span class="custom-tag" title="自定义歌曲"></span>' : ''}
                    <span class="action-icon-btn delete" title="移除">&times;</span>
                </div>
            `;

            if (song.isCustom) {
                div.querySelector('.custom-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditModal(realIndex);
                });
            }

            div.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定移除《${song.title}》吗？`)) {
                    songs.splice(realIndex, 1);
                    savePlaylist();
                    
                    if (realIndex === currentIndex) {
                        if (songs.length > 0) {
                            currentIndex = realIndex % songs.length;
                            loadSong(currentIndex);
                            if (isPlaying) playCurrent();
                        } else {
                            audio.pause();
                            isPlaying = false;
                            loadSong(0);
                        }
                    } else if (realIndex < currentIndex) {
                        currentIndex--;
                    }
                }
            });

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = realIndex;
                loadSong(currentIndex);
                playCurrent();
            });

            container.appendChild(div);
        });
    }

    function updatePlaylistHighlight() {
        const contentDiv = playlist.querySelector('.playlist-content');
        if (contentDiv) renderListContent(contentDiv);
    }

    confirmAddSongBtn.addEventListener('click', () => {
        const title = newSongTitle.value.trim();
        const sub = newSongSub.value.trim();
        const url = newSongUrl.value.trim();

        if (!title || !url) {
            showNotification('歌名和链接不能为空', 'error');
            return;
        }

        const songData = {
            title,
            sub: sub || '未知艺术家',
            url,
            isCustom: true
        };

        if (editModeIndex >= 0) {
            songs[editModeIndex] = songData;
            showNotification('歌曲信息已修改', 'success');
        } else {
            songs.unshift(songData);
            showNotification('歌曲已添加', 'success');
            if (songs.length === 1) loadSong(0);
        }

        searchTerm = '';
        savePlaylist();
        newSongTitle.value = '';
        newSongSub.value = '';
        newSongUrl.value = '';
        hideModal(addSongModal);
    });

    cancelAddSongBtn.addEventListener('click', () => {
        hideModal(addSongModal);
    });

    function setupDrag() {
        let isDragging = false, startX, startY, initialLeft, initialTop, hasMoved = false;
        const dragStart = (e) => {
            if (e.target.closest('.btn') || e.target.closest('.progress-wrapper') || e.target.closest('.playlist-popup')) return;
            const event = e.type === 'touchstart' ? e.touches[0] : e;
            isDragging = true; hasMoved = false;
            startX = event.clientX; startY = event.clientY;
            const rect = player.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            player.style.transition = 'none';
            playlist.style.transition = 'none';
        };
        const dragMove = (e) => {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();
            const event = e.type === 'touchmove' ? e.touches[0] : e;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            const maxLeft = window.innerWidth - player.offsetWidth;
            const maxTop = window.innerHeight - player.offsetHeight;
            player.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            player.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
            const rect = player.getBoundingClientRect();
            playlist.style.left = rect.left + 'px';
playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 65 : 155)) + 'px';
};
        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            player.style.transition = '';
            playlist.style.transition = '';
        };
        player.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        player.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);

        miniView.addEventListener('click', () => {
            if (!hasMoved && player.classList.contains('collapsed')) {
                player.classList.remove('collapsed');
                setTimeout(() => {
                    const rect = player.getBoundingClientRect();
                    playlist.style.top = (rect.top + 150) + 'px';
                }, 300);
            }
        });
    }

    playBtn.addEventListener('click', togglePlay);
    const _next_btnEl = document.getElementById('next-btn');
    if (_next_btnEl) _next_btnEl.addEventListener('click', nextSong);
    const _prev_btnEl = document.getElementById('prev-btn');
    if (_prev_btnEl) _prev_btnEl.addEventListener('click', prevSong);
    const _minimize_btnEl = document.getElementById('minimize-btn');
    if (_minimize_btnEl) _minimize_btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        player.classList.add('collapsed');
        playlist.classList.remove('active');
    });

    progressArea.addEventListener('click', (e) => {
        const width = progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) audio.currentTime = (clickX / width) * duration;
    });

    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.target;
        if (duration) document.getElementById('progress-bar').style.width = `${(currentTime / duration) * 100}%`;
    });
    audio.addEventListener('ended', nextSong);

    const _mode_btnEl = document.getElementById('mode-btn');
    if (_mode_btnEl) _mode_btnEl.addEventListener('click', () => {
        if (playMode === 'sequence') { playMode = 'single'; }
        else if (playMode === 'single') { playMode = 'shuffle'; }
        else { playMode = 'sequence'; }
        document.getElementById('icon-loop').style.display   = playMode === 'sequence' ? 'block' : 'none';
        document.getElementById('icon-single').style.display = playMode === 'single'   ? 'block' : 'none';
        document.getElementById('icon-shuffle').style.display= playMode === 'shuffle'  ? 'block' : 'none';
        const labels = { sequence: '顺序播放', single: '单曲循环', shuffle: '随机播放' };
        showNotification(labels[playMode], 'info', 1000);
    });

    const listBtn = document.getElementById('list-btn');
    listBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = player.getBoundingClientRect();
        playlist.style.left = rect.left + 'px';
        playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 62 : 150)) + 'px';
        playlist.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!playlist.contains(e.target) && !listBtn.contains(e.target) && !player.contains(e.target) && !e.target.closest('#add-song-modal')) {
            playlist.classList.remove('active');
        }
    });
// 显示在线搜索对话框
function showOnlineSearchDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    
    overlay.innerHTML = `
        <div style="
            background:var(--secondary-bg);border-radius:20px;padding:24px;
            width:92%;max-width:450px;max-height:85vh;
            display:flex;flex-direction:column;
            box-shadow:0 20px 60px rgba(0,0,0,0.4);
            animation:modalContentSlideIn 0.3s ease forwards;
        ">
            <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <i class="fas fa-music" style="color:var(--accent-color);"></i>
                <span>在线搜索歌曲</span>
            </div>
            
            <div style="display:flex;gap:8px;margin-bottom:16px;flex-shrink:0;">
                <input type="text" id="online-search-input" placeholder="输入歌曲名或歌手..." style="
                    flex:1;padding:12px 16px;border:1.5px solid var(--border-color);
                    border-radius:12px;background:var(--primary-bg);color:var(--text-primary);
                    font-size:14px;font-family:var(--font-family);outline:none;
                    transition:border-color 0.2s;
                ">
                <button id="online-search-btn" style="
                    padding:0 20px;border:none;border-radius:12px;
                    background:var(--accent-color);color:#fff;
                    font-size:14px;font-weight:600;cursor:pointer;
                    font-family:var(--font-family);display:flex;
                    align-items:center;gap:6px;white-space:nowrap;
                ">
                    <i class="fas fa-search"></i> 搜索
                </button>
            </div>
            
            <div id="search-loading" style="display:none;text-align:center;padding:40px;color:var(--text-secondary);flex:1;">
                <div class="history-spinner" style="margin:0 auto;"></div>
                <p style="margin-top:15px;">正在搜索...</p>
            </div>
            
            <div id="search-results-container" style="
                flex:1;overflow-y:auto;min-height:200px;
                display:flex;flex-direction:column;gap:8px;
            ">
                <div style="text-align:center;padding:40px;color:var(--text-secondary);font-size:13px;">
                    <i class="fas fa-search" style="font-size:32px;opacity:0.3;margin-bottom:12px;display:block;"></i>
                    输入关键词开始搜索
                </div>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:16px;flex-shrink:0;">
                <button id="search-cancel" style="
                    flex:1;padding:12px;border:1.5px solid var(--border-color);
                    border-radius:12px;background:none;color:var(--text-secondary);
                    font-size:13px;cursor:pointer;font-family:var(--font-family);
                ">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const searchInput = overlay.querySelector('#online-search-input');
    const searchBtn = overlay.querySelector('#online-search-btn');
    const loadingEl = overlay.querySelector('#search-loading');
    const resultsContainer = overlay.querySelector('#search-results-container');
    const cancelBtn = overlay.querySelector('#search-cancel');
    
    const closeDialog = () => overlay.remove();
    
    cancelBtn.addEventListener('click', closeDialog);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });
    
    // 执行搜索
    async function performSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            showNotification('请输入搜索关键词', 'warning');
            return;
        }
        
        resultsContainer.style.display = 'none';
        loadingEl.style.display = 'block';
        
        try {
            const results = await searchOnlineSongs(keyword);
            loadingEl.style.display = 'none';
            resultsContainer.style.display = 'flex';
            
            if (results.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align:center;padding:40px;color:var(--text-secondary);font-size:13px;">
                        <i class="fas fa-music" style="font-size:32px;opacity:0.3;margin-bottom:12px;display:block;"></i>
                        未找到相关歌曲
                    </div>
                `;
                return;
            }
            
            renderSearchResults(results, resultsContainer, closeDialog);
        } catch (error) {
            console.error('搜索失败:', error);
            loadingEl.style.display = 'none';
            resultsContainer.style.display = 'flex';
            resultsContainer.innerHTML = `
                <div style="text-align:center;padding:40px;color:#ff6b6b;font-size:13px;">
                    <i class="fas fa-exclamation-circle" style="font-size:32px;opacity:0.5;margin-bottom:12px;display:block;"></i>
                    搜索失败，请重试
                </div>
            `;
        }
    }
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // 自动聚焦
    setTimeout(() => searchInput.focus(), 100);
}

// 搜索在线歌曲（调用网易云API）
async function searchOnlineSongs(keyword) {
    const API_BASE = 'https://api.bugpk.com/api/163_music';
    
    try {
        const response = await fetch(`${API_BASE}?type=search&keywords=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.songs) {
            return data.data.songs.map(song => ({
                id: song.id,
                title: song.name || '未知歌曲',
                sub: song.artists || '未知歌手',
                url: null, // URL需要单独获取
                picUrl: song.picUrl || null,
                isCustom: true,
                source: 'netease'
            }));
        }
        return [];
    } catch (error) {
        console.error('在线搜索失败:', error);
        throw error;
    }
}

// 获取歌曲播放URL
async function getSongUrl(songId) {
    const API_BASE = 'https://api.bugpk.com/api/163_music';
    
    try {
        const response = await fetch(`${API_BASE}?type=url&id=${songId}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data[0] && data.data[0].url) {
            return data.data[0].url;
        }
        return null;
    } catch (error) {
        console.error('获取歌曲URL失败:', error);
        return null;
    }
}

// 渲染搜索结果
function renderSearchResults(results, container, closeDialog) {
    container.innerHTML = '';
    
    results.forEach((song, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display:flex;align-items:center;gap:12px;padding:12px;
            border-radius:12px;border:1px solid var(--border-color);
            background:var(--primary-bg);cursor:pointer;
            transition:all 0.2s;
        `;
        item.onmouseover = () => { item.style.background = 'var(--secondary-bg)'; item.style.borderColor = 'var(--accent-color)'; };
        item.onmouseout = () => { item.style.background = 'var(--primary-bg)'; item.style.borderColor = 'var(--border-color)'; };
        
        item.innerHTML = `
            ${song.picUrl ? `
                <img src="${song.picUrl}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;">
            ` : `
                <div style="width:48px;height:48px;border-radius:8px;background:rgba(var(--accent-color-rgb),0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas fa-music" style="color:var(--accent-color);"></i>
                </div>
            `}
            <div style="flex:1;min-width:0;">
                <div style="font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${song.title}</div>
                <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${song.sub}</div>
            </div>
            <button class="add-song-btn" data-index="${index}" style="
                padding:6px 14px;border:none;border-radius:8px;
                background:var(--accent-color);color:#fff;
                font-size:12px;cursor:pointer;white-space:nowrap;
            ">
                <i class="fas fa-plus"></i> 添加
            </button>
        `;
        
        container.appendChild(item);
        
        // 添加按钮事件
        item.querySelector('.add-song-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const btn = e.target.closest('.add-song-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 获取中';
            
            try {
                const url = await getSongUrl(song.id);
                if (!url) {
                    showNotification('无法获取歌曲播放链接', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-plus"></i> 添加';
                    return;
                }
                
                // 添加到歌单
                const newSong = {
                    title: song.title,
                    sub: song.sub,
                    url: url,
                    isCustom: true
                };
                
                songs.unshift(newSong);
                savePlaylist();
                
                showNotification(`已添加「${song.title}」到歌单`, 'success');
                
                // 如果歌单之前为空，自动播放
                if (songs.length === 1) {
                    currentIndex = 0;
                    loadSong(0);
                }
                
                btn.innerHTML = '<i class="fas fa-check"></i> 已添加';
                btn.style.background = '#51cf66';
                
            } catch (error) {
                console.error('添加失败:', error);
                showNotification('添加失败，请重试', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-plus"></i> 添加';
            }
        });
        
        // 点击整行也可以预览（可选）
        item.addEventListener('click', async (e) => {
            if (e.target.closest('.add-song-btn')) return;
            
            // 预览功能：获取URL并播放
            const url = await getSongUrl(song.id);
            if (url) {
                // 临时播放预览
                const tempAudio = new Audio(url);
                tempAudio.play().catch(() => {
                    showNotification('预览播放失败', 'warning');
                });
            }
        });
    });
}
    loadSong(0);
    renderPlaylist();
    setupDrag();

    // ===== 他给你点歌功能 =====
    const AUTO_PLAY_PROBABILITY = 0.06; // 6% 概率

    function tryAutoPlaySong() {
        // 播放器没开也不触发
        if (!player.classList.contains('visible')) return;
        // 歌单为空也不触发
        if (songs.length === 0) return;

        // 概率判断
        if (Math.random() >= AUTO_PLAY_PROBABILITY) return;

        // 随机选一首歌
        const randomIndex = Math.floor(Math.random() * songs.length);
        const song = songs[randomIndex];

        // 播放这首歌（正在播放也直接换掉）
        currentIndex = randomIndex;
        loadSong(randomIndex);
        audio.play().then(() => {
            isPlaying = true;
            document.getElementById('icon-play').style.display = 'none';
            document.getElementById('icon-pause').style.display = 'block';
            player.classList.add('playing');
        }).catch(() => {});

        // 通知
        if (typeof showNotification === 'function') {
            showNotification('他给你点了一首歌：' + song.title, 'info', 4000);
        }
    }

    // 页面可见时检测
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            tryAutoPlaySong();
        }
    });

    // 定时检测（每2分钟一次）
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            tryAutoPlaySong();
        }
    }, 2 * 60 * 1000);

    // 初始化后延迟一会儿也检测一次
    setTimeout(tryAutoPlaySong, 8000);

    if (settings.musicPlayerEnabled) {
        player.classList.add('visible');
    }
};


window.initMusicPlayerToggle = function initMusicPlayerToggle() {
    const musicToggle = document.getElementById('music-player-toggle');
    if (!musicToggle || musicToggle._musicBound) return;
    musicToggle._musicBound = true;
    musicToggle.addEventListener('click', () => {
        window.settings = window.settings || settings || {};
        settings.musicPlayerEnabled = !settings.musicPlayerEnabled;
        if (typeof throttledSaveData === 'function') throttledSaveData();

        const player = document.getElementById('player');
        const playlist = document.getElementById('playlist');
        const audio = document.getElementById('audio');
        if (settings.musicPlayerEnabled) {
            if (player) player.classList.add('visible');
            if (typeof showNotification === 'function') showNotification('音乐播放器已开启', 'success');
        } else {
            if (player) player.classList.remove('visible');
            if (playlist) playlist.classList.remove('active');
            if (audio) audio.pause();
            if (typeof showNotification === 'function') showNotification('音乐播放器已关闭', 'info');
        }
        const modal = document.getElementById('advanced-modal');
        if (modal && typeof hideModal === 'function') hideModal(modal);
    });
};
