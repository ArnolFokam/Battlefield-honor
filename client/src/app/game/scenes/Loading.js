import Phaser from "phaser";
import playerImage from "./../../assets/images/player.png"
import outdoor from "./../../assets/tilemaps/battle-royale.json";
import outdoorImage from "./../../assets/tilemaps/battle-royale.png";
import bulletImage from "./../../assets/images/bullet.png";
import cursorImage from "./../../assets/cursor.cur";
import bulletSound from "./../../assets/sound/bulletsound.mp3";
import backgroundMusic1 from "./../../assets/sound/backgroundMusic1.mp3";
import backgroundMusic2 from "./../../assets/sound/backgroundMusic2.mp3";
import PlayScene from "./Play";

export default class LoadingScene extends Phaser.Scene {


    name = ""; //when declare outside a function, they are treated as private properties of the class and are accessed with this.[property name]

    constructor() {
        super("load");
    }

    init(params) {
        this.name = params.name;
    }

    preload() {
        let self = this;

        this.load.audio('bulletSound', bulletSound);
        this.load.audio('backgroundMusic', [backgroundMusic1, backgroundMusic2]);
        this.load.image("tiles", outdoorImage);
        this.load.tilemapTiledJSON("map", outdoor);
        this.load.image('player', playerImage);
        this.load.image('bullet', bulletImage);

        let height = this.game.scale.height;
        let width = this.game.scale.width;

        let background = this.add.graphics();
        let progressBox = this.add.graphics();
        let progress = this.add.graphics();
        let loadingText = this.add.text((width / 2) - 75, (height / 2) + 45, 'Loading...', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#fff'
        });

        let percentageText = this.add.text((width / 2) - 12, (height / 2) - 8, '0%', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            color: '#fff'
        });

        this.load.on('progress', function (value) {
            background.fillStyle(0x008040);
            progressBox.fillRect(0, 0, width, height);
            progressBox.fillStyle(0x00C0FF);
            progressBox.fillRoundedRect(width / 4, (height / 2) - 22.5, width / 2, 45, 10).setAlpha(0.5, 0.5, 0.5, 0.5);
            progress.clear();
            progress.lineStyle(5, 0xFF0000);
            progress.fillStyle(0xFFC000);
            progress.fillRoundedRect(width / 4, (height / 2) - 22.5, (width / 2) * value, 45, 10);
            progress.strokeRoundedRect(width / 4, (height / 2) - 22.5, width / 2, 45, 10);
            percentageText.setText(Math.floor(value * 100) + "%");
        });
        this.load.on('complete', function () {
            //undo loading stuffs and start the game
            background.destroy();
            progressBox.destroy();
            progress.destroy();
            loadingText.destroy();
            percentageText.destroy();
            self.scene.start("play", {
                name: self.name
            });

            delete self.name;

            self.scene.stop("load");

        });
    }

    create() {}

    update() {}

}