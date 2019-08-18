import HealthBar from "./../UI/components/healthBar.js";

export default class HUDScene extends Phaser.Scene {

    name; //when declare outside a function, they are treated as private properties of the class and are accessed with this.[property name]
    score = 0;
    connected = 0;

    constructor() {
        super('HUD');
    }

    init(params){
        
        this.name = params.name;
        this.connected = params.players_online;
    }

    create() {

        //  Grab a reference to the Game Scene
        let PlayScene = this.scene.get('play');

        let name = this.add.text(0, 70, this.name + "'s party", {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40,
                y: 10
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD);

        let score = this.add.text(0, 100, "number of kills : " + this.score, {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1,
            padding: {
                x: 40,
                y: 10
            },
        }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD);


        this.healthBar = new HealthBar(PlayScene, 40, 40, 200, 30, true);

        //Listen for events from it
        PlayScene.events.on("addKills", function() {

            this.score += 1;

            score.setText("number of kills: " + this.score);

        }, this);

        PlayScene.events.on("damage", function() {

            this.healthBar.decrease(10);

        }, this);

        this.connected_HUD = this.add.text(0, window.innerHeight - 100, this.connected , {
                fontFamily: '"Varela Round", sans-serif',
                fontSize: "40px",
                fill: "#FFFFFF",
                strokeThickness: 2,
                align: "center",
                padding: {
                    x: 50,
                    y: 10
                },
            }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD).setOrigin(0);

        this.add.text(0, window.innerHeight - 50, "online", {
                fontFamily: '"Varela Round", sans-serif',
                fontSize: "20px",
                fill: "#FFFFFF",
                padding: {
                    x: 40,
                    y: 10
                },
            }).setScrollFactor(0).setDepth(PlayScene.gameDepth.HUD);

        PlayScene.events.on("players_in_game", function(number) {
            this.connected_HUD.setText(number)
        }, this);

    }
}