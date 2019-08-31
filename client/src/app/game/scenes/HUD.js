import HealthBar from "./../UI/components/healthBar.js";
import {
    mobileAndTabletcheck
} from "./../../utils/utils.js"
import {
    ScaleModes
} from "phaser";

export default class HUDScene extends Phaser.Scene {

    name; //when declare outside a function, they are treated as private properties of the class and are accessed with this.[property name]
    score = 0;
    connected = 0;
    reloadArc = null;
    reloadTimer = null;
    reloadTimeText = null;
    width = window.innerWidth / 2;
    height = window.innerHeight / 2;
    reloadModal = null;
    reloadingText = null;
    bulletsNumText = null;
    scale = 1;
    reloadButtonTextOffset = 75;

    player1Name = null;
    player1Kills = null;
    player2Name = null;
    player2Kills = null;
    player3Name = null;
    player3Kills = null;
    player4Name = null;
    player4Kills = null;
    player5Name = null;
    player5Kills = null;

    constructor() {
        super('HUD');
    }

    init(params) {

        this.name = params.name;
        this.connected = params.players_online;
    }

    create() {

        if (mobileAndTabletcheck()) {
            this.scale = 0.85;
            this.reloadText = "Tap the player to reload";
            this.reloadButtonTextOffset = 105;
        } else {
            this.scale = 1;
            this.reloadText = "Press R to reload";
            this.reloadButtonTextOffset = 75;
        }

        //  Grab a reference to the Game Scene
        let PlayScene = this.scene.get('play');

        let name = this.add.text(0 * this.scale, 70 * this.scale, this.name + "'s party", {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        let score = this.add.text(0 * this.scale, 100 * this.scale, "number of kills : " + this.score, {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);


        this.healthBar = new HealthBar(PlayScene, 40 * this.scale, 40 * this.scale, 200 * this.scale, 30 * this.scale, true);

        //Listen for events from it
        PlayScene.events.on("addKills", function() {

            this.score += 1;

            score.setText("number of kills: " + this.score);

        }, this);

        PlayScene.events.on("damage", function() {

            this.healthBar.decrease(10);

        }, this);

        this.connected_HUD = this.add.text(0 * this.scale, window.innerHeight - 100 * this.scale, this.connected, {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "40px",
            fill: "#FFFFFF",
            strokeThickness: 2,
            align: "center",
            padding: {
                x: 50 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setOrigin(0).setScale(this.scale);

        this.add.text(0 * this.scale, window.innerHeight - 50 * this.scale, "online", {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            padding: {
                x: 40 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        PlayScene.events.on("players_in_game", function(number) {
            this.connected_HUD.setText(number)
        }, this);

        this.reloadModal = this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(this.width - 80 * this.scale, this.height - 112 * this.scale, 160 * this.scale, 192 * this.scale, 10 * this.scale).setActive(false).setVisible(false).setDepth(PlayScene.gameDepth.HUD);

        this.reloadArc = this.add.graphics().setActive(false).setVisible(false).setDepth(PlayScene.gameDepth.HUD);

        this.reloadingText = this.add.text(this.width - 64 * this.scale, this.height - 96 * this.scale, 'Reloading...', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '24px',
            color: '#fff'
        }).setActive(false).setVisible(false).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        this.reloadTimeText = this.add.text(this.width - 20 * this.scale, this.height - 8 * this.scale, '', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            color: '#fff'
        }).setActive(false).setVisible(false).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        PlayScene.events.on("reload", function(num_bullets) {
            if (num_bullets < 20) {
                this.reloadModal.setActive(true).setVisible(true);
                this.reloadingText.setActive(true).setVisible(true);
                this.reloadTimer = this.time.addEvent({
                    delay: 125,
                    callback: () => {
                        let angle = 45 * this.reloadTimer.getRepeatCount();
                        this.reloadArc.clear();
                        let bullets = Math.floor((20 - num_bullets) * this.reloadTimer.getOverallProgress() + num_bullets);
                        this.bulletsNumText.setText(("0" + bullets).slice(-2) + "/20");
                        this.reloadButtonText.destroy();
                        this.bulletsNumText.setColor("#fff");
                        let reloadTime = this.reloadTimer.getOverallProgress() * 5.0;
                        this.reloadTimeText.setText(reloadTime.toString().substr(0, 3) + ' s').setActive(true).setVisible(true);
                        this.reloadArc.setActive(true).setVisible(true).lineStyle(6, 0xffffff).beginPath().arc(this.width, this.height, 50 * this.scale, Phaser.Math.DegToRad(angle + 90), Phaser.Math.DegToRad(angle + 180), true).strokePath();
                        if (this.reloadTimer.getRepeatCount() <= 0 && this.reloadTimer.getElapsed() == 125) {
                            this.isReloading = false;
                            this.reloadModal.setActive(false).setVisible(false);
                            this.reloadingText.setActive(false).setVisible(false);
                            this.reloadArc.setActive(false).setVisible(false);
                            this.reloadTimeText.setText('').setActive(false).setVisible(false);
                            this.events.emit("reload_finished");
                            this.reloadTimer.remove();
                        }
                    },
                    callbackScope: this,
                    repeat: 40
                });
                PlayScene.gunReload.play();
            }
        }, this);


        this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(this.width - 131 * this.scale, window.innerHeight - 144 * this.scale, 250 * this.scale, 128 * this.scale, 10 * this.scale).setDepth(PlayScene.gameDepth.HUD);

        this.add.text(this.width - 42 * this.scale, window.innerHeight - 120 * this.scale, 'Bullets', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);


        this.bulletsNumText = this.add.text(this.width - 50 * this.scale, window.innerHeight - 84 * this.scale, '20/20', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '32px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        PlayScene.events.on("bullets_num_changed", function(num_bullets) {
            if (this.bulletsNumText) {
                this.bulletsNumText.setText(("0" + num_bullets).slice(-2) + "/20");
                if (num_bullets <= 0) {
                    this.reloadButtonText = this.add.text(this.width - this.reloadButtonTextOffset * this.scale, window.innerHeight - 47 * this.scale, this.reloadText, {
                        fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
                        fontSize: '18px',
                        fontStyle: 'bold',
                        color: '#f00'
                    }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
                    
                    this.bulletsNumText.setColor("#f00");
                } else {
                    this.bulletsNumText.setColor("#fff");
                }
            }
        }, this);

        this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(window.innerWidth - 192 * this.scale, 16, 176 * this.scale, 192 * this.scale, 10 * this.scale).setDepth(PlayScene.gameDepth.HUD);
        this.add.text(window.innerWidth - 155 * this.scale, 36 * this.scale, 'Leaderboard', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.add.text(window.innerWidth - 62 * this.scale, 62 * this.scale, 'Kills', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player1Name = this.add.text(window.innerWidth - 176 * this.scale, 90 * this.scale, '1. ', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player1Kills = this.add.text(window.innerWidth - 48 * this.scale, 90 * this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player2Name = this.add.text(window.innerWidth - 176 * this.scale, 114 * this.scale, '2. ', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player2Kills = this.add.text(window.innerWidth - 48 * this.scale, 114 * this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player3Name = this.add.text(window.innerWidth - 176 * this.scale, 138 * this.scale, '3. ', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player3Kills = this.add.text(window.innerWidth - 48 * this.scale, 138 * this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player4Name = this.add.text(window.innerWidth - 176 * this.scale, 162 * this.scale, '4. ', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player4Kills = this.add.text(window.innerWidth - 48 * this.scale, 162 * this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player5Name = this.add.text(window.innerWidth - 176 * this.scale, 186 * this.scale, '5. ', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);
        this.player5Kills = this.add.text(window.innerWidth - 48 * this.scale, 186 * this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '12px',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        PlayScene.events.on("leaderboard", function(killsList) {
            this.player1Name.setText("1. " + killsList[0].name.substr(0, 13));
            this.player1Kills.setText(killsList[0].kills);
            this.player2Name.setText("2. " + ((killsList[1] == undefined) ? "" : killsList[1].name).substr(0, 13));
            this.player2Kills.setText((killsList[1] == undefined) ? "0" : killsList[1].kills);
            this.player3Name.setText("3. " + ((killsList[2] == undefined) ? "" : killsList[2].name).substr(0, 13));
            this.player3Kills.setText((killsList[2] == undefined) ? "0" : killsList[1].kills);
            this.player4Name.setText("4. " + ((killsList[3] == undefined) ? "" : killsList[3].name).substr(0, 13));
            this.player4Kills.setText((killsList[3] == undefined) ? "0" : killsList[1].kills);
            this.player5Name.setText("2. " + ((killsList[4] == undefined) ? "" : killsList[4].name).substr(0, 13));
            this.player5Kills.setText((killsList[4] == undefined) ? "0" : killsList[1].kills);
        }, this);
    }
}