import HealthBar from "./../UI/components/healthBar.js";
import ShieldBar from "./../UI/components/shieldBar.js";

import {
    mobileAndTabletcheck
} from "./../../utils/utils.js"
import {
    ScaleModes
} from "phaser";

export default class HUDScene extends Phaser.Scene {

    //when declare outside a function, they are treated as private properties of the class and are accessed with this.[property name]

    width = window.innerWidth / 2;
    height = window.innerHeight / 2;
    scale = 1;

    reloadButtonTextOffset = 75;

    topPlayers = {
        "player1": {
            name: null,
            kills: null
        },
        "player2": {
            name: null,
            kills: null
        },
        "player3": {
            name: null,
            kills: null
        },
        "player4": {
            name: null,
            kills: null
        },
        "player5": {
            name: null,
            kills: null
        }
    }

    constructor() {
        super('HUD');
        this.name = '';
        this.score = 0;
        this.dimension = {

        }
    }

    init(params) {

        this.name = params.name;
        this.initialConnected = params.players_online;
        this.initialKillsList = params.killsList;
    }

    create() {

        if (mobileAndTabletcheck()) {
            this.scale = 0.67;
            this.reloadText = "Tap the player to reload";
            this.reloadButtonTextOffset = 105;
        } else {
            this.scale = 1;
            this.reloadText = "Press R to reload";
            this.reloadButtonTextOffset = 75;
        }

        //  Grab a reference to the Game Scene
        let PlayScene = this.scene.get('play');

        let name = this.add.text(0 * this.scale, 17 * this.scale, this.name + "'s party", {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

        let score = this.add.text(0 * this.scale, 130 * this.scale, "number of kills : " + this.score, {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40 * this.scale,
                y: 10 * this.scale
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);


        this.healthBar = new HealthBar({ scene: this, x: 80 * this.scale, y: 60 * this.scale, width: 200 * this.scale, height: 30 * this.scale, fixed: true });
        this.add.image(50 * this.scale, 75 * this.scale, "healthPowerup").setScale(0.7*this.scale);

        this.shieldBar = new ShieldBar({ scene: this, x: 80 * this.scale, y: 110 * this.scale, width: 200 * this.scale, height: 20 * this.scale, fixed: true });
        this.add.image(50 * this.scale, 120 * this.scale, "shieldPowerup").setScale(0.7*this.scale);


        //Listen for events from it
        PlayScene.events.on("addKills", function() {

            this.score += 1;

            score.setText("number of kills: " + this.score);

        }, this);

        PlayScene.events.on("health_changed", function(amount) {

            this.healthBar.setTo(amount);

        }, this);

        PlayScene.events.on("shield_changed", function(amount) {

            this.shieldBar.setTo(amount);

        }, this);

        this.connected_HUD = this.add.text(0 * this.scale, window.innerHeight - 100 * this.scale, this.initialConnected, {
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

        delete this.initialConnected;

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
                        if (this.reloadButtonText) {
                            this.reloadButtonText.destroy();
                        }
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

        for (let i = 1, j = 90; i < 6; i++) {
            this.topPlayers[`player${i}`].name = this.add.text(window.innerWidth - 176 * this.scale, j * this.scale, `${i}.`, {
                fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
                fontSize: '12px',
                color: '#fff'
            }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

            this.topPlayers[`player${i}`].kills = this.add.text(window.innerWidth - 48 * this.scale, j * this.scale, '0', {
                fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
                fontSize: '12px',
                color: '#fff'
            }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale);

            j = j + 24;
        }

        this.updateLeaderboard(this.initialKillsList);
        delete this.initialKillsList;


        PlayScene.events.on("leaderboard", function(killsList) {
            this.updateLeaderboard(killsList)
        }, this);

        this.healthButton = this.add.image( window.innerWidth - 60 * this.scale, window.innerHeight/2 - 95*this.scale, "healthPowerupHUD").setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setAlpha(0.6).setInteractive().on("pointerdown", () => {
            PlayScene.powerups.useItem("health");
        }).on("pointerover", () => {
            this.input.setDefaultCursor('pointer');
        }).on("pointerout", () => {
            this.input.setDefaultCursor('crosshair');
        });
        this.healthItemsBackground = this.add.graphics().fillCircle(window.innerWidth - 20*this.scale, window.innerHeight/2  - 135*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD).setAlpha(0.7);
        this.healthItems = this.add.text(window.innerWidth - 20* this.scale , window.innerHeight/2  - 135*this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setOrigin(0.5);



        this.blinkButton = this.add.image( window.innerWidth - 60*this.scale, window.innerHeight/2 , "blinkPowerupHUD").setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setAlpha(0.6).setInteractive().on("pointerdown", () => {
            PlayScene.powerups.useItem("blink");
        }).on("pointerover", () => {
            this.input.setDefaultCursor('pointer');
        }).on("pointerout", () => {
            this.input.setDefaultCursor('crosshair');
        });
        this.blinkItemsBackground = this.add.graphics().fillCircle(window.innerWidth - 20*this.scale, window.innerHeight/2  - 40*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD).setAlpha(0.7);
        this.blinkItems = this.add.text(window.innerWidth - 20* this.scale, window.innerHeight/2  - 40* this.scale, '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setOrigin(0.5);



        this.shieldButton = this.add.image( window.innerWidth - 60*this.scale, window.innerHeight/2 + 95*this.scale, "shieldPowerupHUD").setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setAlpha(0.6).setInteractive().on("pointerdown", () => {
            PlayScene.powerups.useItem("shield");
        }).on("pointerover", () => {
            this.input.setDefaultCursor('pointer');
        }).on("pointerout", () => {
            this.input.setDefaultCursor('crosshair');
        });
        this.shieldItemsBackground = this.add.graphics().fillCircle(window.innerWidth - 20*this.scale, window.innerHeight/2  + 55*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD).setAlpha(0.7);
        this.shieldItems = this.add.text(window.innerWidth - 20* this.scale , window.innerHeight/2  + 55* this.scale , '0', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#fff'
        }).setDepth(PlayScene.gameDepth.HUD).setScale(this.scale).setOrigin(0.5);

        if (mobileAndTabletcheck()) {

            this.shieldItemsBackground.destroy();
            this.healthItemsBackground.destroy();
            this.blinkItemsBackground.destroy();

            this.shieldItemsBackground = this.add.graphics().fillCircle(window.innerWidth/2 + (40 - 5 - 100)*this.scale, (40-5)*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD);
            this.shieldButton.setPosition(window.innerWidth/2 - 100*this.scale, 40).setScale(this.scale*0.7);
            this.shieldItems.setPosition(window.innerWidth/2 + (40 - 5 - 100)*this.scale, (40-5)*this.scale).setDepth(PlayScene.gameDepth.HUD+1);

            this.healthItemsBackground = this.add.graphics().fillCircle(window.innerWidth/2 + (40 - 5)*this.scale, (40-5)*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD);
            this.healthButton.setPosition(window.innerWidth/2, 40).setScale(this.scale*0.7);
            this.healthItems.setPosition(window.innerWidth/2 + (40 - 5)*this.scale, (40-5)*this.scale).setDepth(PlayScene.gameDepth.HUD+1);

            this.blinkItemsBackground = this.add.graphics().fillCircle(window.innerWidth/2 + (40 - 5 + 100)*this.scale, (40-5)*this.scale, 15*this.scale).setDepth(PlayScene.gameDepth.HUD);
            this.blinkButton.setPosition(window.innerWidth/2 + 100*this.scale, 40).setScale(this.scale*0.7);
            this.blinkItems.setPosition(window.innerWidth/2 + (40 - 5 + 100)*this.scale, (40-5)*this.scale).setDepth(PlayScene.gameDepth.HUD+1);
        }

        PlayScene.events.on("item_changed",  function(items){
            this.healthItems.setText(items["health"]);
            this.shieldItems.setText(items["shield"]);
            this.blinkItems.setText(items["blink"]);
        }, this);


    }

    updateLeaderboard(killsList) {
        for (let i = 1; i < 6; i++) {
            this.topPlayers[`player${i}`].name.setText(`${i}. ` + (killsList[i - 1] ? killsList[i - 1].name : "").substr(0, 13));
            this.topPlayers[`player${i}`].kills.setText(killsList[i - 1] ? killsList[i - 1].kills : "0");
        }
    }
}