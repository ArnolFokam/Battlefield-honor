import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super("gameOver");
        this.dimensions = {
            statsContainer: {
                x: window.innerWidth/2 - 200,
                y: 150,
                w: 400,
                h: 350
            } 
        }

        this.dimensions.playAgainButton = {
            x: this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/4,
            y: this.dimensions.statsContainer.y + 280,
            w: 130,
            h: 50
        }

        this.dimensions.shareButton = {
            x: this.dimensions.statsContainer.x + this.dimensions.statsContainer.w - 100,
            y: this.dimensions.statsContainer.y + 280,
            w: 170,
            h: 50
        }
    }

    init(params) {
        this.score = params.score;
        this.hits = params.hits;
        this.time_survived = this.msToTime(params.time_survived);
    }

    preload() {}

    create() {
        this.add.graphics().fillStyle(0x000000, 0.6).fillRect(0, 0, window.innerWidth, window.innerHeight);

        this.statsContainer = this.add.graphics().fillStyle(0x000000, 0.7).fillRect(this.dimensions.statsContainer.x, this.dimensions.statsContainer.y, this.dimensions.statsContainer.w, this.dimensions.statsContainer.h);

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/2, this.dimensions.statsContainer.y + 40, 'Stats', {
            fontFamily: '"Valera Round", "Product Sans", "sans-serif"',
            fontSize: '32px',
            color: '#fff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/8, this.dimensions.statsContainer.y + 100, 'score: ' + this.score , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "26px",
            fill: "#FFFFFF",
            strokeThickness: 1
        })

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/8, this.dimensions.statsContainer.y + 150, 'time survived: ' + this.time_survived , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "26px",
            fill: "#FFFFFF",
            strokeThickness: 1
        });

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/8, this.dimensions.statsContainer.y + 200, 'hits: ' + this.hits , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "26px",
            fill: "#FFFFFF",
            strokeThickness: 1
        });

        this.playAgainButton = this.add.image(this.dimensions.playAgainButton.x, this.dimensions.playAgainButton.y , 'playAgainButton').setInteractive().setDisplaySize(this.dimensions.playAgainButton.w, this.dimensions.playAgainButton.h);
        this.add.text(this.dimensions.playAgainButton.x, this.dimensions.playAgainButton.y , "play again" , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1
        }).setOrigin(0.5);

        this.shareButton = this.add.image( this.dimensions.shareButton.x, this.dimensions.shareButton.y, 'shareButton').setInteractive().setDisplaySize(this.dimensions.shareButton.w, this.dimensions.shareButton.h);
        this.add.text(this.dimensions.shareButton.x, this.dimensions.shareButton.y , "share the game" , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "20px",
            fill: "#FFFFFF",
            strokeThickness: 1
        }).setOrigin(0.5);

        this.playAgainButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer')
        }).on('pointerout', () => {
            this.input.setDefaultCursor('crosshair')
        }).on('pointerdown', () => {
            window.open((window.location.protocol === "http:") ? `http://${document.location.host}` : `https://${document.location.host}`, "_self");
        });

        this.shareButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer')
        }).on('pointerout', () => {
            this.input.setDefaultCursor('crosshair')
        }).on('pointerdown', () => {
            this.input.setDefaultCursor('crosshair')
        });

    }

    update() {}

    msToTime(duration) {
        let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds
    }

}