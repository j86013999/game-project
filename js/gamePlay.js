let w = 640;
let h = 367;
let mailNum = 0;
let RoadWidth = 51;
let firstRoad = 76;
let secRoad = firstRoad + RoadWidth*1;
let thirdRoad = firstRoad + RoadWidth*2;
let forthRoad = firstRoad + RoadWidth*3;
let fifthRoad = firstRoad + RoadWidth*4;
let sixthRoad = firstRoad + RoadWidth*5;
let startPosition = thirdRoad;
let gameLevel = 1;
let gameOver = true;
//設定遊戲要產生多少個信件
let creatMail = 1000;
let creatObstacle = 1000;
const RandomNum = (max, min) =>{
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
// 遊戲物件物理化
const physics = (object) =>{
  object.body.immovable = true;
  object.body.moves = false;
};
// 遊戲物件反向移動數度
const speed = (object)=>{
  object.x -=2.5 * gameLevel
};
//產生遊戲物件數量與各自距離陣列
const obPosition = (object)=>{
  let objectArr = [];
  let start = 300;
  for(let i = 0 ; i<object; i++){
    start += RandomNum(100,300);
    objectArr.push(start);
  };
  return objectArr;
};

const gamePlay = {
  key: 'gamePlay',
  preload: function(){
      // 載入資源
      this.load.image('ground', 'images/bg/ground.jpg');
      this.load.image('sky', 'images/bg/sky.jpg');
      this.load.image('mountain', 'images/bg/mountain.png');
      this.load.image('bucket', 'images/obstacle/bucket.png');
      this.load.image('stone', 'images/obstacle/stone.png');
      this.load.image('tree', 'images/obstacle/tree.png');
      this.load.image('fullScreenSign', 'images/bg/fullscreen.png');
      // spritesheet要設定影格寬與高
      this.load.spritesheet('mail', 'images/player/mail.png',{frameWidth:36,frameHeight:33});
      this.load.spritesheet('player', 'images/player/player.png', {frameWidth:69,frameHeight:50});
      // 音檔
      this.load.audio('horseSound', 'sound/horse_run.mp3');
      this.load.audio('getScoreSound', 'sound/getScore.mp3');
  },
  create: function(){
      let _this = this;
      // 資源載入完成，加入遊戲物件及相關設定
      // 三種容器放圖片tileSprite/sprite/image
      // tileSprite是可重複出現的東西，sprite是雪碧圖、img不用設寬高
      this.goUp = this.add.tileSprite(w/2, 91.75, w, h/2, 'ground');
      this.goDown = this.add.tileSprite(w/2, 367-91.75, w, h/2, 'ground');
      this.goUp.setInteractive();
      this.goDown.setInteractive();
      this.sky = this.add.tileSprite(w/2, 54/2, w, 54, 'sky');
      this.mountain = this.add.tileSprite(w/2, 42, w, 42, 'mountain');
      this.ground = this.add.tileSprite(w/2, 215, w, 304, 'ground');
      this.fullScreenSign = this.add.image(600, 30, 'fullScreenSign');
      this.fullScreenSign.setScale(0.1);
      this.fullScreenSign.setInteractive();
      this.fullScreenSign.on('pointerdown', () => {this.scale.toggleFullscreen();});
      

       // 畫面左下角信件分數位置
      this.mailScore = this.add.sprite(50,340,'mail');
      // 添加文字
      this.score = this.add.text(80,325, `X ${mailNum}`, {color:'black', fontSize: '20px', fontFamily:"roboto"});
      this.Lv = this.add.text(20,20, `Lv：${gameLevel}`, {color:'black', fontSize: '20px', fontFamily:"roboto"});

      // 玩家設定
      this.player = this.physics.add.sprite(180,startPosition,'player');
      physics(this.player)
      this.player.setDepth(100);
      this.player.setSize(40, 30);
      this.anims.create({
        key:'run',
        frames:this.anims.generateFrameNumbers('player', {start: 8, end: 15}),
        frameRate: 16,
        repeat:-1
      });

    
      this.anims.create({
        key:'ready',
        frames:this.anims.generateFrameNumbers('player', {start: 0, end: 6}),
        frameRate: 8,
        repeat:-1
      });
      this.player.anims.play('ready', true);

      setTimeout(function(){
        _this.player.anims.stop('ready', true);
        _this.player.anims.play('run', true);
        gameOver = false
      },1000)


      // 障礙物位置設定
      const obstacles = [
        {name: 'tree', x: obPosition(creatObstacle), y: [firstRoad, secRoad, thirdRoad, forthRoad, fifthRoad, sixthRoad]},
        {name: 'stone', x: obPosition(creatObstacle), y: [firstRoad, secRoad, thirdRoad, forthRoad, fifthRoad, sixthRoad]},
        {name: 'bucket', x: obPosition(creatObstacle), y: [firstRoad, secRoad, thirdRoad, forthRoad, fifthRoad, sixthRoad]},
      ];
      for (let i = 0; i < creatObstacle; i++) {
        let randomX = RandomNum(2, 0)
        let randomY = RandomNum(5, 0)
        this['obstacle'+ i] = this.physics.add.image(obstacles[randomX].x[i], obstacles[randomX].y[randomY], obstacles[randomX].name);
        physics(this['obstacle'+i]);
        this['obstacle'+i].setSize(50, 59);
        // 玩家與信件重疊得分
        this.physics.add.collider(this.player, this['obstacle'+i], playerDead);
      };

      // 信件位置設定
      const mails = {name: 'mail', x: obPosition(creatMail), y: [firstRoad, secRoad, thirdRoad, forthRoad, fifthRoad, sixthRoad]};
      for (let i = 0; i < creatMail; i++) {
        let random = RandomNum(5, 0)
        this['mail'+ i] = this.physics.add.sprite(mails.x[i], mails.y[random], mails.name);
        physics(this['mail'+i]);
        this.anims.create({
          key:'mailFly',
          frames:this.anims.generateFrameNumbers('mail', {start: 0, end: 14}),
          frameRate: 15,
          repeat:-1
        })
        this['mail' + i].anims.play('mailFly', true);
        // 玩家與信件重疊得分
        this.physics.add.overlap(this.player, this['mail'+i], getScore);
      };

      // 設定鍵盤
      this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.goUp.on('pointerdown', () => {
        if(startPosition>firstRoad){
          this.player.setPosition(180, startPosition-=RoadWidth);
        }
      });
      this.goDown.on('pointerdown', () => {
        if(startPosition<firstRoad+RoadWidth*5){
          this.player.setPosition(180, startPosition+=RoadWidth);
        }
      });
      // // 馬跑音檔
      this.horseSound = this.sound.add('horseSound');
      this.horseSound.loop = true;
      this.horseSound.volume = 0.3;
      setTimeout(()=>{this.horseSound.play();},700)
      // // 得分音檔
      // this.getScoreSound = this.sound.add('getScoreSound');
      // this.getScoreSound.volume = 0.6;
      // this.getScoreSound.setRate(2);

      // 取得分數
      function getScore(player, mail){
        mailNum ++;
        if(mailNum%5 === 0){
          gameLevel += 1
          _this.Lv.setText(`Lv：${gameLevel}`);
        }
        mail.destroy()
        _this.score.setText(`X ${mailNum}`);
        // _this.getScoreSound.play();
      }

      function playerDead(player, obstacle){
        gameOver = true
        _this.gameOver= _this.add.text(w/2 -120,h/3, `Game Over`, {color:'white', fontSize: '50px', fontFamily:"roboto"});
        _this.startAgain= _this.add.text(w/2 -120,h/2, `press here to restart`, {color:'brown', fontSize: '30px', fontFamily:"roboto"});
        _this.player.anims.stop('run', true);
        // _this.horseSound.stop();
        _this.startAgain.setInteractive();
        _this.startAgain.on('pointerdown', () => {
          _this.scene.start('gamePlay');
          startPosition = thirdRoad
          gameLevel = 1;
          mailNum = 0;
        });
      }
    },
    update: function(){
      if(gameOver)  return
      // 遊戲狀態更新
      this.sky.tilePositionX += 1 * gameLevel;
      this.mountain.tilePositionX += 2 * gameLevel;
      this.ground.tilePositionX += 2.5 * gameLevel;
      for(let i = 0; i < creatMail; i++){
        speed(this['mail' + i])
      };
      for(let i = 0; i < creatObstacle; i++){
        speed(this['obstacle'+ i])
      };

      // 玩家移動範圍
      if(Phaser.Input.Keyboard.JustDown(this.up)){
        if(startPosition>firstRoad){
          this.player.setPosition(180, startPosition-=RoadWidth);
        }
      }else if(Phaser.Input.Keyboard.JustDown(this.down)){
        if(startPosition<firstRoad+RoadWidth*5){
          this.player.setPosition(180, startPosition+=RoadWidth);
        }
      }
  }
};


const config = {
  type: Phaser.AUTO,
  width: w,
  height: h,
  parent: 'app',
  physics:{
    default:'arcade',
    arcade:{
      gravity:{
        y:700
      },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [gamePlay]
};

const game = new Phaser.Game(config);