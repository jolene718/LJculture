// 游戏核心类
class LiPatternPuzzle {
    constructor() {
        this.currentLevel = 0;
        this.currentChapter = 0;
        this.gridSize = { rows: 5, cols: 5 };
        this.grid = [];
        this.solution = [];
        this.rowHints = [];
        this.colHints = [];
        this.selectedColor = 'black';
        this.history = [];
        this.historyIndex = -1;
        this.hintsRemaining = 3;
        this.startTime = null;
        this.mistakes = 0;
        this.collectedPatterns = [];
        this.currentTutorialStep = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLevels();
        this.adjustGameSize();
        this.showWelcomeScreen();
    }

    // 动态调整游戏尺寸
    adjustGameSize() {
        // 获取父容器大小
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        // 计算可用空间和窗口大小
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 设置游戏容器的最大宽度和样式
        if (windowWidth < 1200) {
            gameContainer.style.maxWidth = '100%';
            gameContainer.style.padding = '15px';
        } else {
            gameContainer.style.maxWidth = '1200px';
            gameContainer.style.margin = '0 auto';
            gameContainer.style.padding = '20px';
        }

        // 根据屏幕尺寸动态设置单元格大小
        let cellSize;
        const availableWidth = windowWidth - 40; // 减去边距

        // 为不同屏幕尺寸设置不同的单元格大小
        if (windowWidth < 360) {
            cellSize = 14;
        } else if (windowWidth < 480) {
            cellSize = 16;
        } else if (windowWidth < 768) {
            cellSize = Math.min(30, containerWidth / 15, containerHeight / 15);
        } else if (windowWidth < 1200) {
            cellSize = Math.min(40, containerWidth / 12, containerHeight / 12);
        } else {
            cellSize = Math.min(48, containerWidth / 10, containerHeight / 10);
        }

        // 如果已有网格，确保网格不会超出屏幕宽度
        if (this.grid.length > 0) {
            const gridWidth = this.grid[0].length * cellSize;
            const maxAllowedWidth = availableWidth * 0.7; // 留出30%空间给侧边栏

            // 如果网格太宽，缩小单元格大小
            if (gridWidth > maxAllowedWidth) {
                cellSize = Math.floor(maxAllowedWidth / this.grid[0].length);
                // 确保单元格不会太小
                cellSize = Math.max(cellSize, 14);
            }
        }

        // 更新CSS变量
        document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);

        // 调整网格容器样式
        const gridContainer = document.getElementById('gridContainer');
        if (gridContainer) {
            gridContainer.style.maxHeight = `${windowHeight * 0.6}px`; // 限制网格高度
        }

        // 如果游戏已经加载，更新网格
        if (this.grid.length > 0) {
            this.updateGridDisplay();
            if (document.getElementById('patternPreview')) {
                this.drawPatternPreview();
            }
        }

        // 更新已收集的纹样
        this.updateCollectedPatterns();

        // 调整弹窗位置
        const modals = document.querySelectorAll('.welcome-screen, .level-complete-screen, .tutorial-screen');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                const content = modal.querySelector('[class$="-content"]');
                if (content) {
                    content.style.maxWidth = `${windowWidth * 0.9}px`;
                }
            }
        });
    }

    // 加载关卡数据
    loadLevels() {
        this.levels = [
            // 第一章：织机初识
            {
                chapter: '第一章：织机初识',
                levels: [
                    {
                        name: '十字纹',
                        size: { rows: 5, cols: 5 },
                        solution: [
                            ['empty', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'empty'],
                            ['black', 'black', 'black', 'black', 'black'],
                            ['empty', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'empty']
                        ],
                        description: '十字纹象征大地四方，天地相连，是黎族最基础的纹样之一。',
                        culturalInfo: '在黎族文化中，十字纹不仅是装饰，更是对宇宙观的表达。横线代表大地，竖线代表天空，交叉点象征着人类生活的世界。'
                    },
                    {
                        name: '菱形纹',
                        size: { rows: 7, cols: 7 },
                        solution: [
                            ['empty', 'empty', 'empty', 'black', 'empty', 'empty', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['black', 'red', 'red', 'yellow', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'empty', 'empty', 'black', 'empty', 'empty', 'empty']
                        ],
                        description: '菱形纹是黎族织锦中最常见的几何纹样，象征着丰收和富足。',
                        culturalInfo: '菱形在黎族文化中代表稻田和粮仓，中心的黄色象征稻谷，红色代表丰收的喜悦，黑色边框象征保护和稳固。'
                    },
                    {
                        name: '波浪纹',
                        size: { rows: 5, cols: 9 },
                        solution: [
                            ['black', 'empty', 'empty', 'black', 'empty', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'empty', 'empty', 'black', 'empty', 'empty', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'empty', 'black', 'empty', 'empty', 'black'],
                            ['empty', 'black', 'empty', 'empty', 'black', 'empty', 'empty', 'black', 'empty'],
                            ['black', 'empty', 'empty', 'black', 'empty', 'empty', 'black', 'empty', 'empty']
                        ],
                        description: '波浪纹象征着水的流动，代表生命的源泉。',
                        culturalInfo: '海南四面环海，水在黎族生活中占有重要地位。波浪纹不仅代表海水，也象征着河流和雨水，是祈求风调雨顺的纹样。'
                    }
                ]
            },
            // 第二章：蛙鸣稻香
            {
                chapter: '第二章：蛙鸣稻香',
                levels: [
                    {
                        name: '蛙纹',
                        size: { rows: 7, cols: 7 },
                        solution: [
                            ['empty', 'black', 'empty', 'empty', 'empty', 'black', 'empty'],
                            ['black', 'red', 'black', 'empty', 'black', 'red', 'black'],
                            ['black', 'red', 'red', 'black', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'empty', 'black', 'empty', 'black', 'empty'],
                            ['black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black']
                        ],
                        description: '蛙纹是黎族最神圣的图腾之一，象征生育和繁衍。',
                        culturalInfo: '在黎族神话中，青蛙是雷公的化身，掌管雨水。蛙纹常出现在女性的筒裙上，寓意多子多福，家族兴旺。红色的蛙身代表生命力，黑色轮廓象征保护。'
                    },
                    {
                        name: '稻穗纹',
                        size: { rows: 9, cols: 5 },
                        solution: [
                            ['empty', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'yellow', 'black', 'empty'],
                            ['black', 'yellow', 'yellow', 'yellow', 'black'],
                            ['empty', 'black', 'yellow', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'yellow', 'black', 'empty'],
                            ['black', 'yellow', 'yellow', 'yellow', 'black'],
                            ['empty', 'black', 'yellow', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'empty']
                        ],
                        description: '稻穗纹代表农业丰收，是黎族农耕文化的体现。',
                        culturalInfo: '稻米是黎族的主食，稻穗纹常用于节庆服饰，表达对丰收的感恩和对来年的祈愿。黄色象征成熟的稻谷，排列整齐寓意年年有余。'
                    },
                    {
                        name: '鱼纹',
                        size: { rows: 7, cols: 9 },
                        solution: [
                            ['empty', 'empty', 'empty', 'black', 'empty', 'black', 'empty', 'empty', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'red', 'red', 'red', 'red', 'red', 'black', 'empty'],
                            ['black', 'red', 'red', 'white', 'red', 'white', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'red', 'red', 'red', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'empty', 'empty', 'black', 'empty', 'black', 'empty', 'empty', 'empty']
                        ],
                        description: '鱼纹象征富裕和吉祥，常见于黎族的生活用品装饰。',
                        culturalInfo: '鱼在黎族文化中寓意"年年有余"，白色的鱼眼代表智慧和灵动，红色的鱼身象征活力和生机。鱼纹常用于婚礼服饰，祝福新人生活富足。'
                    },
                    {
                        name: '花卉纹',
                        size: { rows: 7, cols: 7 },
                        solution: [
                            ['empty', 'empty', 'black', 'black', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'yellow', 'red', 'yellow', 'black', 'empty'],
                            ['black', 'yellow', 'red', 'red', 'red', 'yellow', 'black'],
                            ['black', 'red', 'red', 'yellow', 'red', 'red', 'black'],
                            ['black', 'yellow', 'red', 'red', 'red', 'yellow', 'black'],
                            ['empty', 'black', 'yellow', 'red', 'yellow', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'black', 'black', 'empty', 'empty']
                        ],
                        description: '花卉纹代表美好和希望，是黎族女性最喜爱的装饰纹样。',
                        culturalInfo: '花卉纹源于黎族对大自然的热爱，红色花瓣象征热情，黄色花蕊代表希望。这种纹样常出现在少女的头巾和腰带上，表达对美好生活的向往。'
                    }
                ]
            },
            // 第三章：龙被传说
            {
                chapter: '第三章：龙被传说',
                levels: [
                    {
                        name: '龙纹',
                        size: { rows: 9, cols: 9 },
                        solution: [
                            ['empty', 'empty', 'black', 'black', 'black', 'black', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'red', 'red', 'yellow', 'red', 'red', 'black', 'empty'],
                            ['black', 'red', 'black', 'white', 'red', 'white', 'black', 'red', 'black'],
                            ['black', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'black'],
                            ['black', 'yellow', 'red', 'yellow', 'yellow', 'yellow', 'red', 'yellow', 'black'],
                            ['black', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'empty', 'black', 'empty', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black', 'empty']
                        ],
                        description: '龙纹是黎族织锦中最尊贵的纹样，只有在重要场合才使用。',
                        culturalInfo: '龙被是黎族织锦艺术的巅峰之作，历史上作为贡品进献朝廷。龙纹融合了汉族龙文化与黎族本土信仰，白色的眼睛象征智慧，红色身躯代表力量，黄色鳞片寓意尊贵。'
                    },
                    {
                        name: '凤凰纹',
                        size: { rows: 9, cols: 9 },
                        solution: [
                            ['empty', 'empty', 'empty', 'black', 'empty', 'black', 'empty', 'empty', 'empty'],
                            ['empty', 'black', 'black', 'red', 'black', 'red', 'black', 'black', 'empty'],
                            ['black', 'red', 'red', 'red', 'yellow', 'red', 'red', 'red', 'black'],
                            ['black', 'red', 'white', 'red', 'red', 'red', 'white', 'red', 'black'],
                            ['empty', 'black', 'red', 'yellow', 'yellow', 'yellow', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'red', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'yellow', 'black', 'red', 'black', 'yellow', 'black', 'empty'],
                            ['black', 'yellow', 'empty', 'empty', 'black', 'empty', 'empty', 'yellow', 'black'],
                            ['empty', 'black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black', 'empty']
                        ],
                        description: '凤凰纹象征吉祥和重生，是黎族神话中的神鸟。',
                        culturalInfo: '凤凰在黎族文化中是祥瑞之鸟，常与龙纹成对出现。白色的眼睛代表纯洁，红色的身躯象征火的力量，黄色的尾羽寓意光明。凤凰纹多用于重要的礼仪场合。'
                    }
                ]
            },
            // 第四章：甘工鸟之歌
            {
                chapter: '第四章：甘工鸟之歌',
                levels: [
                    {
                        name: '甘工鸟纹',
                        size: { rows: 7, cols: 7 },
                        solution: [
                            ['empty', 'black', 'empty', 'empty', 'empty', 'black', 'empty'],
                            ['black', 'yellow', 'black', 'empty', 'black', 'yellow', 'black'],
                            ['black', 'yellow', 'red', 'black', 'red', 'yellow', 'black'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'black', 'black', 'black', 'black', 'empty'],
                            ['black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black']
                        ],
                        description: '甘工鸟是黎族的吉祥鸟，象征着幸福和美满。',
                        culturalInfo: '甘工鸟在黎族传说中是报喜的使者，黄色的翅膀象征丰收，红色的身体代表喜庆。这种纹样常用于新婚夫妇的床品，寓意百年好合。'
                    },
                    {
                        name: '鸟巢纹',
                        size: { rows: 7, cols: 7 },
                        solution: [
                            ['black', 'black', 'black', 'black', 'black', 'black', 'black'],
                            ['black', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
                            ['black', 'yellow', 'red', 'white', 'red', 'yellow', 'black'],
                            ['black', 'yellow', 'white', 'white', 'white', 'yellow', 'black'],
                            ['black', 'yellow', 'red', 'white', 'red', 'yellow', 'black'],
                            ['black', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
                            ['black', 'black', 'black', 'black', 'black', 'black', 'black']
                        ],
                        description: '鸟巢纹象征家庭和睦，子孙满堂。',
                        culturalInfo: '鸟巢在黎族文化中代表温暖的家，白色的鸟蛋象征新生命，黄色的巢穴代表财富，红色点缀寓意生活红火。常用于祝福新居和生育。'
                    },
                    {
                        name: '双鸟纹',
                        size: { rows: 5, cols: 11 },
                        solution: [
                            ['black', 'empty', 'black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black', 'empty', 'black'],
                            ['black', 'red', 'black', 'empty', 'empty', 'black', 'empty', 'empty', 'black', 'red', 'black'],
                            ['empty', 'black', 'red', 'black', 'black', 'yellow', 'black', 'black', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'red', 'red', 'red', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'empty', 'empty', 'black', 'black', 'black', 'black', 'black', 'empty', 'empty', 'empty']
                        ],
                        description: '双鸟纹代表夫妻恩爱，比翼双飞。',
                        culturalInfo: '双鸟相对是黎族爱情题材的经典纹样，红色代表热烈的爱情，黄色的纽带象征缘分。这种纹样是黎族婚礼织品的必备图案。'
                    }
                ]
            },
            // 第五章：人形图腾
            {
                chapter: '第五章：人形图腾',
                levels: [
                    {
                        name: '人形纹',
                        size: { rows: 9, cols: 5 },
                        solution: [
                            ['empty', 'black', 'black', 'black', 'empty'],
                            ['empty', 'black', 'red', 'black', 'empty'],
                            ['black', 'black', 'red', 'black', 'black'],
                            ['black', 'red', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'black', 'empty'],
                            ['empty', 'black', 'red', 'black', 'empty'],
                            ['empty', 'black', 'empty', 'black', 'empty'],
                            ['black', 'empty', 'empty', 'empty', 'black'],
                            ['black', 'empty', 'empty', 'empty', 'black']
                        ],
                        description: '人形纹是祖先崇拜的体现，代表族群的延续。',
                        culturalInfo: '人形纹是黎族最古老的纹样之一，代表对祖先的崇敬。红色的身躯象征血脉相承，黑色轮廓代表庄严神圣。此纹样多用于祭祀和重大仪式。'
                    },
                    {
                        name: '舞蹈纹',
                        size: { rows: 7, cols: 9 },
                        solution: [
                            ['black', 'empty', 'black', 'empty', 'empty', 'empty', 'black', 'empty', 'black'],
                            ['black', 'red', 'black', 'empty', 'black', 'empty', 'black', 'red', 'black'],
                            ['empty', 'black', 'red', 'black', 'yellow', 'black', 'red', 'black', 'empty'],
                            ['empty', 'empty', 'black', 'red', 'red', 'red', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'empty', 'black', 'red', 'black', 'empty', 'black', 'empty'],
                            ['black', 'empty', 'empty', 'black', 'empty', 'black', 'empty', 'empty', 'black'],
                            ['black', 'empty', 'black', 'empty', 'empty', 'empty', 'black', 'empty', 'black']
                        ],
                        description: '舞蹈纹展现黎族传统舞蹈的动态美。',
                        culturalInfo: '舞蹈是黎族文化的重要组成部分，此纹样捕捉了竹竿舞的瞬间。黄色代表竹竿，红色的人形展现舞者的活力，整体构图富有韵律感。'
                    },
                    {
                        name: '祖先纹',
                        size: { rows: 9, cols: 7 },
                        solution: [
                            ['empty', 'empty', 'black', 'black', 'black', 'empty', 'empty'],
                            ['empty', 'black', 'white', 'red', 'white', 'black', 'empty'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['black', 'yellow', 'red', 'red', 'red', 'yellow', 'black'],
                            ['black', 'red', 'red', 'red', 'red', 'red', 'black'],
                            ['empty', 'black', 'red', 'red', 'red', 'black', 'empty'],
                            ['empty', 'black', 'black', 'red', 'black', 'black', 'empty'],
                            ['black', 'empty', 'black', 'empty', 'black', 'empty', 'black'],
                            ['black', 'empty', 'empty', 'empty', 'empty', 'empty', 'black']
                        ],
                        description: '祖先纹是对先辈的纪念和敬仰。',
                        culturalInfo: '此纹样常见于祠堂和族谱织物上，白色的眼睛代表祖先的智慧永存，黄色的装饰象征尊贵地位，红色主体代表血脉传承不息。'
                    }
                ]
            },
            // 终章：千年织梦
            {
                chapter: '终章：千年织梦',
                levels: [
                    {
                        name: '五龙被',
                        size: { rows: 11, cols: 11 },
                        solution: [
                            ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
                            ['black', 'yellow', 'red', 'red', 'yellow', 'white', 'yellow', 'red', 'red', 'yellow', 'black'],
                            ['black', 'red', 'black', 'red', 'red', 'red', 'red', 'red', 'black', 'red', 'black'],
                            ['black', 'red', 'red', 'black', 'yellow', 'red', 'yellow', 'black', 'red', 'red', 'black'],
                            ['black', 'yellow', 'red', 'yellow', 'black', 'red', 'black', 'yellow', 'red', 'yellow', 'black'],
                            ['black', 'white', 'red', 'red', 'red', 'black', 'red', 'red', 'red', 'white', 'black'],
                            ['black', 'yellow', 'red', 'yellow', 'black', 'red', 'black', 'yellow', 'red', 'yellow', 'black'],
                            ['black', 'red', 'red', 'black', 'yellow', 'red', 'yellow', 'black', 'red', 'red', 'black'],
                            ['black', 'red', 'black', 'red', 'red', 'red', 'red', 'red', 'black', 'red', 'black'],
                            ['black', 'yellow', 'red', 'red', 'yellow', 'white', 'yellow', 'red', 'red', 'yellow', 'black'],
                            ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black']
                        ],
                        description: '五龙被是黎族织锦的最高成就，集所有纹样精华于一身。',
                        culturalInfo: '五龙被是黎族织锦艺术的巅峰，历史上只有最高贵的场合才能使用。它融合了龙纹、凤纹、人形纹等多种图腾，是黎族文化的集大成者。完成此关卡，意味着您已经掌握了黎族纹样的精髓！'
                    }
                ]
            }
        ];
    }

    // 设置事件监听器
    setupEventListeners() {
        // 欢迎界面按钮
        document.getElementById('btnStart').addEventListener('click', () => this.startGame());
        document.getElementById('btnTutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('btnCloseTutorial').addEventListener('click', () => this.closeTutorial());

        // 颜色选择
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectColor(e.target.closest('.color-btn').dataset.color));
        });

        // 工具栏按钮
        document.getElementById('btnUndo').addEventListener('click', () => this.undo());
        document.getElementById('btnRedo').addEventListener('click', () => this.redo());
        document.getElementById('btnClear').addEventListener('click', () => this.clearGrid());
        document.getElementById('btnHint').addEventListener('click', () => this.showHint());
        document.getElementById('btnValidate').addEventListener('click', () => this.validateSolution());

        // 关卡完成界面
        document.getElementById('btnNextLevel').addEventListener('click', () => this.nextLevel());
        document.getElementById('btnReplay').addEventListener('click', () => this.replayLevel());

        // 教程导航
        document.getElementById('btnPrevStep').addEventListener('click', () => this.prevTutorialStep());
        document.getElementById('btnNextStep').addEventListener('click', () => this.nextTutorialStep());

        // 返回按钮
        document.getElementById('btnBack').addEventListener('click', () => this.showWelcomeScreen());

        // 添加窗口大小变化监听器
        window.addEventListener('resize', () => this.adjustGameSize());
    }

    // 显示欢迎界面
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('levelCompleteScreen').style.display = 'none';
        document.getElementById('tutorialScreen').style.display = 'none';
    }

    // 开始游戏
    startGame() {
        document.getElementById('welcomeScreen').style.display = 'none';
        this.loadLevel(0, 0);
        this.startTime = Date.now();
    }

    // 加载关卡
    loadLevel(chapterIndex, levelIndex) {
        this.currentChapter = chapterIndex;
        this.currentLevel = levelIndex;

        const chapter = this.levels[chapterIndex];
        const level = chapter.levels[levelIndex];

        // 更新界面信息
        document.getElementById('chapterName').textContent = chapter.chapter;
        document.getElementById('currentLevel').textContent = levelIndex + 1;
        document.getElementById('patternDescription').textContent = level.description;

        // 设置网格大小
        this.gridSize = level.size;
        this.solution = level.solution;

        // 生成提示
        this.generateHints();

        // 调整游戏尺寸以适应新的网格大小
        this.adjustGameSize();

        // 创建网格
        this.createGrid();

        // 重置游戏状态
        this.history = [];
        this.historyIndex = -1;
        this.mistakes = 0;
        this.hintsRemaining = 3;
        document.getElementById('hintsLeft').textContent = this.hintsRemaining;

        // 绘制预览
        this.drawPatternPreview();
    }

    // 生成行列提示
    generateHints() {
        this.rowHints = [];
        this.colHints = [];

        // 生成行提示
        for (let row = 0; row < this.gridSize.rows; row++) {
            const hints = [];
            let currentColor = null;
            let count = 0;

            for (let col = 0; col < this.gridSize.cols; col++) {
                const color = this.solution[row][col];

                if (color !== 'empty') {
                    if (color === currentColor) {
                        count++;
                    } else {
                        if (currentColor !== null) {
                            hints.push({ color: currentColor, count });
                        }
                        currentColor = color;
                        count = 1;
                    }
                } else {
                    if (currentColor !== null) {
                        hints.push({ color: currentColor, count });
                        currentColor = null;
                        count = 0;
                    }
                }
            }

            if (currentColor !== null) {
                hints.push({ color: currentColor, count });
            }

            this.rowHints.push(hints.length > 0 ? hints : [{ color: 'empty', count: 0 }]);
        }

        // 生成列提示
        for (let col = 0; col < this.gridSize.cols; col++) {
            const hints = [];
            let currentColor = null;
            let count = 0;

            for (let row = 0; row < this.gridSize.rows; row++) {
                const color = this.solution[row][col];

                if (color !== 'empty') {
                    if (color === currentColor) {
                        count++;
                    } else {
                        if (currentColor !== null) {
                            hints.push({ color: currentColor, count });
                        }
                        currentColor = color;
                        count = 1;
                    }
                } else {
                    if (currentColor !== null) {
                        hints.push({ color: currentColor, count });
                        currentColor = null;
                        count = 0;
                    }
                }
            }

            if (currentColor !== null) {
                hints.push({ color: currentColor, count });
            }

            this.colHints.push(hints.length > 0 ? hints : [{ color: 'empty', count: 0 }]);
        }
    }

    // 创建游戏网格 - 性能优化版本
    createGrid() {
        const startTime = performance.now(); // 性能测量

        const gridContainer = document.getElementById('gridContainer');
        const rowHintsContainer = document.getElementById('rowHints');
        const colHintsContainer = document.getElementById('colHints');

        // 清空容器
        gridContainer.innerHTML = '';
        rowHintsContainer.innerHTML = '';
        colHintsContainer.innerHTML = '';

        // 设置网格样式
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize.cols}, var(--cell-size))`;
        gridContainer.style.gridTemplateRows = `repeat(${this.gridSize.rows}, var(--cell-size))`;

        // 使用文档片段批量处理DOM操作
        const colHintFragment = document.createDocumentFragment();
        const rowHintFragment = document.createDocumentFragment();
        const gridFragment = document.createDocumentFragment();

        // 创建列提示
        for (let col = 0; col < this.gridSize.cols; col++) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'col-hint';

            // 缓存colHints数组访问
            const hints = this.colHints[col];
            for (let i = 0; i < hints.length; i++) {
                const hint = hints[i];
                if (hint.count > 0) {
                    const span = document.createElement('span');
                    span.className = `hint-number ${hint.color}`;
                    span.textContent = hint.count;
                    hintDiv.appendChild(span);
                }
            }

            colHintFragment.appendChild(hintDiv);
        }

        // 一次性添加列提示
        colHintsContainer.appendChild(colHintFragment);

        // 创建行提示
        for (let row = 0; row < this.gridSize.rows; row++) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'row-hint';

            // 缓存rowHints数组访问
            const hints = this.rowHints[row];
            for (let i = 0; i < hints.length; i++) {
                const hint = hints[i];
                if (hint.count > 0) {
                    const span = document.createElement('span');
                    span.className = `hint-number ${hint.color}`;
                    span.textContent = hint.count;
                    hintDiv.appendChild(span);
                }
            }

            rowHintFragment.appendChild(hintDiv);
        }

        // 一次性添加行提示
        rowHintsContainer.appendChild(rowHintFragment);

        // 初始化网格数组
        this.grid = [];
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                this.grid[row][col] = 'empty';

                // 创建网格单元
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                gridFragment.appendChild(cell);
            }
        }

        // 一次性添加所有网格单元
        gridContainer.appendChild(gridFragment);

        // 移除之前的事件监听器（避免重复添加）
        gridContainer.removeEventListener('click', this._gridClickHandler);
        gridContainer.removeEventListener('contextmenu', this._gridContextMenuHandler);

        // 创建事件委托处理函数
        this._gridClickHandler = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell) {
                this.cellClick(e);
            }
        };

        this._gridContextMenuHandler = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell) {
                e.preventDefault();
                this.cellRightClick(e);
            }
        };

        // 添加事件委托
        gridContainer.addEventListener('click', this._gridClickHandler);
        gridContainer.addEventListener('contextmenu', this._gridContextMenuHandler);

        // 性能测量和日志
        const endTime = performance.now();
        console.log(`网格创建耗时: ${(endTime - startTime).toFixed(2)}ms`);
    }

    // 单元格点击事件
    cellClick(e) {
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // 保存历史
        this.saveHistory();

        // 切换单元格状态
        if (this.grid[row][col] === this.selectedColor) {
            this.grid[row][col] = 'empty';
            cell.className = 'grid-cell';
        } else {
            this.grid[row][col] = this.selectedColor;
            cell.className = `grid-cell filled-${this.selectedColor}`;
        }

        // 更新进度
        this.updateProgress();
    }

    // 右键标记
    cellRightClick(e) {
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.grid[row][col] === 'empty') {
            cell.classList.toggle('marked-x');
        }
    }

    // 选择颜色
    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.color-btn[data-color="${color}"]`).classList.add('active');
    }

    // 保存历史记录
    saveHistory() {
        // 移除当前索引之后的历史
        this.history = this.history.slice(0, this.historyIndex + 1);

        // 添加新的历史状态
        this.history.push(JSON.parse(JSON.stringify(this.grid)));
        this.historyIndex++;

        // 限制历史记录数量
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    // 撤销
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.grid = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.updateGridDisplay();
            this.updateProgress();
        }
    }

    // 重做
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.grid = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.updateGridDisplay();
            this.updateProgress();
        }
    }

    // 清空网格
    clearGrid() {
        this.saveHistory();
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                this.grid[row][col] = 'empty';
            }
        }
        this.updateGridDisplay();
        this.updateProgress();
    }

    // 更新网格显示
    updateGridDisplay() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const color = this.grid[row][col];

            cell.className = 'grid-cell';
            if (color !== 'empty') {
                cell.classList.add(`filled-${color}`);
            }
        });
    }

    // 显示提示
    showHint() {
        if (this.hintsRemaining <= 0) {
            alert('没有提示了！');
            return;
        }

        // 找到一个错误或空白的格子
        let hintGiven = false;
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.grid[row][col] !== this.solution[row][col]) {
                    // 显示正确答案
                    this.grid[row][col] = this.solution[row][col];
                    const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                    cell.className = 'grid-cell';
                    if (this.solution[row][col] !== 'empty') {
                        cell.classList.add(`filled-${this.solution[row][col]}`);
                    }
                    cell.classList.add('correct');
                    setTimeout(() => cell.classList.remove('correct'), 1000);

                    hintGiven = true;
                    break;
                }
            }
            if (hintGiven) break;
        }

        if (hintGiven) {
            this.hintsRemaining--;
            document.getElementById('hintsLeft').textContent = this.hintsRemaining;
            this.updateProgress();
        }
    }

    // 验证答案
    validateSolution() {
        let correct = true;
        let mistakes = 0;

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);

                if (this.grid[row][col] !== this.solution[row][col]) {
                    correct = false;
                    mistakes++;
                    cell.classList.add('wrong');
                    setTimeout(() => cell.classList.remove('wrong'), 500);
                } else if (this.grid[row][col] !== 'empty') {
                    cell.classList.add('correct');
                    setTimeout(() => cell.classList.remove('correct'), 500);
                }
            }
        }

        if (correct) {
            this.levelComplete();
        } else {
            this.mistakes += mistakes;
        }
    }

    // 关卡完成
    levelComplete() {
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - this.startTime) / 1000);

        // 计算分数
        const baseScore = 100;
        const timeBonus = Math.max(0, 120 - timeSpent);
        const perfectBonus = this.mistakes === 0 ? 50 : 0;
        const totalScore = baseScore + timeBonus + perfectBonus;

        // 获取当前关卡信息
        const level = this.levels[this.currentChapter].levels[this.currentLevel];

        // 添加到已收集纹样
        if (!this.collectedPatterns.includes(level.name)) {
            this.collectedPatterns.push(level.name);
            this.updateCollectedPatterns();
        }

        // 更新完成界面
        document.getElementById('patternName').textContent = level.name;
        document.getElementById('baseScore').textContent = baseScore;
        document.getElementById('timeBonus').textContent = timeBonus;
        document.getElementById('perfectBonus').textContent = perfectBonus;
        document.getElementById('totalScore').textContent = totalScore;
        document.getElementById('culturalDescription').textContent = level.culturalInfo;

        // 绘制解锁的纹样
        this.drawUnlockedPattern();

        // 显示完成界面
        document.getElementById('levelCompleteScreen').style.display = 'flex';
    }

    // 下一关
    nextLevel() {
        document.getElementById('levelCompleteScreen').style.display = 'none';

        let nextLevelIndex = this.currentLevel + 1;
        let nextChapterIndex = this.currentChapter;

        if (nextLevelIndex >= this.levels[nextChapterIndex].levels.length) {
            nextChapterIndex++;
            nextLevelIndex = 0;
        }

        if (nextChapterIndex < this.levels.length) {
            this.loadLevel(nextChapterIndex, nextLevelIndex);
            this.startTime = Date.now();
        } else {
            alert('恭喜你完成了所有关卡！');
            this.showWelcomeScreen();
        }
    }

    // 重玩本关
    replayLevel() {
        document.getElementById('levelCompleteScreen').style.display = 'none';
        this.loadLevel(this.currentChapter, this.currentLevel);
        this.startTime = Date.now();
    }

    // 更新进度
    updateProgress() {
        let filled = 0;
        let total = 0;

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                if (this.solution[row][col] !== 'empty') {
                    total++;
                    if (this.grid[row][col] === this.solution[row][col]) {
                        filled++;
                    }
                }
            }
        }

        const progress = total > 0 ? Math.floor((filled / total) * 100) : 0;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `完成度: ${progress}%`;
    }

    // 绘制纹样预览
    drawPatternPreview() {
        const canvas = document.getElementById('patternPreview');
        const ctx = canvas.getContext('2d');
        const cellSize = Math.min(canvas.width / this.gridSize.cols, canvas.height / this.gridSize.rows);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const color = this.solution[row][col];
                const x = col * cellSize;
                const y = row * cellSize;

                if (color !== 'empty') {
                    ctx.fillStyle = this.getColorCode(color);
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }

    // 绘制解锁的纹样
    drawUnlockedPattern() {
        const canvas = document.getElementById('unlockedPattern');
        const ctx = canvas.getContext('2d');
        const cellSize = Math.min(canvas.width / this.gridSize.cols, canvas.height / this.gridSize.rows);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const color = this.solution[row][col];
                const x = col * cellSize + (canvas.width - cellSize * this.gridSize.cols) / 2;
                const y = row * cellSize + (canvas.height - cellSize * this.gridSize.rows) / 2;

                if (color !== 'empty') {
                    ctx.fillStyle = this.getColorCode(color);
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }

    // 获取颜色代码
    getColorCode(color) {
        const colors = {
            'black': '#2C1810',
            'red': '#CD5C5C',
            'yellow': '#FFD700',
            'white': '#FFF8DC',
            'empty': 'transparent'
        };
        return colors[color] || 'transparent';
    }

    // 更新已收集纹样
    updateCollectedPatterns() {
        const container = document.getElementById('collectedList');
        container.innerHTML = '';

        this.collectedPatterns.forEach(patternName => {
            const div = document.createElement('div');
            div.className = 'pattern-item';
            div.title = patternName;

            // 添加小图标或缩略图
            const canvas = document.createElement('canvas');
            canvas.width = 48;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');

            // 找到对应的纹样数据
            let patternData = null;
            for (let chapter of this.levels) {
                for (let level of chapter.levels) {
                    if (level.name === patternName) {
                        patternData = level;
                        break;
                    }
                }
                if (patternData) break;
            }

            if (patternData) {
                const cellSize = Math.min(48 / patternData.size.cols, 48 / patternData.size.rows);
                const offsetX = (48 - cellSize * patternData.size.cols) / 2;
                const offsetY = (48 - cellSize * patternData.size.rows) / 2;

                // 绘制缩略图
                for (let row = 0; row < patternData.size.rows; row++) {
                    for (let col = 0; col < patternData.size.cols; col++) {
                        const color = patternData.solution[row][col];
                        if (color !== 'empty') {
                            ctx.fillStyle = this.getColorCode(color);
                            ctx.fillRect(
                                offsetX + col * cellSize,
                                offsetY + row * cellSize,
                                cellSize - 0.5,
                                cellSize - 0.5
                            );
                        }
                    }
                }
            }

            div.appendChild(canvas);
            container.appendChild(div);
        });
    }

    // 教程相关
    showTutorial() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('tutorialScreen').style.display = 'flex';
        this.currentTutorialStep = 1;
        this.updateTutorialStep();
    }

    closeTutorial() {
        document.getElementById('tutorialScreen').style.display = 'none';
        this.startGame();
    }

    prevTutorialStep() {
        if (this.currentTutorialStep > 1) {
            this.currentTutorialStep--;
            this.updateTutorialStep();
        }
    }

    nextTutorialStep() {
        if (this.currentTutorialStep < 3) {
            this.currentTutorialStep++;
            this.updateTutorialStep();
        }
    }

    updateTutorialStep() {
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.classList.remove('active');
        });

        document.querySelector(`.tutorial-step[data-step="${this.currentTutorialStep}"]`).classList.add('active');
        document.querySelector('.step-indicator').textContent = `${this.currentTutorialStep} / 3`;

        document.getElementById('btnPrevStep').disabled = this.currentTutorialStep === 1;
        document.getElementById('btnNextStep').disabled = this.currentTutorialStep === 3;
    }
}

// 游戏性能监控函数
function monitorPerformance() {
    // 记录游戏加载时间
    const loadTime = performance.now() - window.performance.timing.navigationStart;
    console.log(`游戏加载时间: ${loadTime.toFixed(2)}ms`);

    // 帧率监控
    let frameCount = 0;
    let lastTime = performance.now();

    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastTime;

        if (elapsedTime > 1000) {
            const fps = Math.round((frameCount * 1000) / elapsedTime);
            // 只在控制台输出，不影响用户体验
            if (fps < 30) {
                console.log(`性能警告: 当前帧率 ${fps} FPS`);
            }
            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(updateFPS);
    }

    // 启动帧率监控
    requestAnimationFrame(updateFPS);
}

// 延迟加载非关键资源
function lazyLoadResources() {
    // 可以在这里添加延迟加载图片、声音等资源的逻辑
    // 例如使用IntersectionObserver监控元素可见性
    console.log('非关键资源开始延迟加载');
    // 这里可以添加实际的延迟加载代码
}

// 游戏初始化 - 使用延迟加载和性能优化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面DOM加载完成，开始初始化游戏...');

    // 确保游戏容器样式正确应用
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.width = '100%';
        gameContainer.style.height = 'auto';
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.justifyContent = 'center';
    }

    // 初始化游戏实例
    const game = new LiPatternPuzzle();

    // 存储游戏实例到window对象，便于调试
    window.gameInstance = game;

    // 监听窗口大小变化 - 使用节流函数优化
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            game.adjustGameSize();
        }, 100); // 100ms节流
    });

    // 启动性能监控
    monitorPerformance();

    // 延迟加载非关键资源
    setTimeout(lazyLoadResources, 1000);
});

// 添加页面卸载前保存游戏状态
window.addEventListener('beforeunload', function () {
    if (window.gameInstance) {
        // 保存游戏状态到localStorage
        try {
            window.gameInstance.saveProgress();
        } catch (e) {
            console.error('保存游戏状态失败:', e);
        }
    }
});