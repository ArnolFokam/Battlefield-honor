import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super("gameOver");
        this.dimensions = {
            statsContainer: {
                x: window.innerWidth/2 - 200,
                y: 150,
                w: 400,
                h: 320
            }
        }
    }

    init(params) {
        this.score = params.score;
        this.hits = params.hits;
        this.time_survived = params.time_survived;
    }

    preload() {}

    create() {
        this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, window.innerWidth, window.innerHeight);

        this.statsContainer = this.add.graphics().fillStyle(0x000000, 0.85).fillRect(this.dimensions.statsContainer.x, this.dimensions.statsContainer.y, this.dimensions.statsContainer.w, this.dimensions.statsContainer.h);

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

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/8, this.dimensions.statsContainer.y + 150, 'time survived: ' + this.time_survived + ' ms' , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "26px",
            fill: "#FFFFFF",
            strokeThickness: 1
        })

        this.add.text(this.dimensions.statsContainer.x + this.dimensions.statsContainer.w/8, this.dimensions.statsContainer.y + 200, 'hits: ' + this.hits , {
            fontFamily: '"Varela Round", sans-serif',
            fontSize: "26px",
            fill: "#FFFFFF",
            strokeThickness: 1
        })

    }

    update() {}

}