import Phaser from "phaser";
import playerImage from "./../../assets/images/player.png"
import outdoor from "./../../assets/tilemaps/battle-royale.json";
import outdoorImage from "./../../assets/tilemaps/battle-royale.png";
import bulletImage from "./../../assets/images/bullet.png";
import cursorImage from "./../../assets/cursor.cur";
import bulletSound from "./../../assets/sound/bulletsound.mp3";
import backgroundMusic1 from "./../../assets/sound/backgroundMusic1.mp3";
import backgroundMusic2 from "./../../assets/sound/backgroundMusic2.mp3";
import gunReload from "./../../assets/sound/gunReload.mp3";
import noBullets from "./../../assets/sound/noBullets.mp3";
import PlayScene from "./Play";
import Button from "./../../assets/images/button.png"
import virtualjoystick from "./../plugins/rexvirtualjoystickplugin.min.js";

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
        this.load.audio('noBullets', noBullets);
        this.load.audio('gunReload', gunReload);
        this.load.audio('backgroundMusic', [backgroundMusic1, backgroundMusic2]);
        this.load.image("tiles", outdoorImage);
        this.load.tilemapTiledJSON("map", outdoor);
        this.load.image('player', playerImage);
        this.load.image('bullet', bulletImage);
        this.load.image('button', Button);

        this.load.plugin('rexvirtualjoystickplugin', virtualjoystick, true);

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
            background.fillRect(0, 0, width, height);
            background.fillStyle(0x008040);
            progress.clear();
            progress.fillStyle(0xFFC000);
            progress.fillRect(width / 4, (height / 2) - 22.5, (width / 2) * value, 45);
            percentageText.setText(Math.ceil(value * 100) + "%");
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