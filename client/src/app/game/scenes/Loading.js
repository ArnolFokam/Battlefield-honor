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

        let progress = this.add.graphics();
        /*let loadingText = this.add.text((width / 2) - 120, (height / 2) + 40, 'Loading...', {
            fontFamily: '"Valera Round", "sans-serif"',
            fontSize: '30px',
            fill: '#fff'
        });*/

        this.load.on('progress', function(value) {
            //place loading
        });
        this.load.on('complete', function() {
            //undo loading stuffs and start the game
            progress.destroy();

            self.scene.start("play", { name: self.name });

            delete self.name;

            self.scene.stop("load");

        });
    }

    create() {
    }

    update() {}

}