export default class HealthBar {
    constructor(scene, x, y, width, height, fixed) {

        this.x = x;
        this.y = y;
        this.value = 100;
        this.width = width;
        this.height = height;
        this.ratio = this.width / 100;
        this.border = {
            size: 4,
        }
        this.fixed = fixed || false


        this.bar = new Phaser.GameObjects.Graphics(scene).setDepth(scene.gameDepth.HUD);
        this.bar.setScrollFactor(0);
        this.draw();

        scene.add.existing(this.bar);
    }

    decrease(amount) {
        this.value -= amount;

        if (this.value < 0) {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x - (this.border.size/2), this.y - (this.border.size/2), this.width + this.border.size, this.height + this.border.size);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        if (this.value >= 80 && this.value <= 100) {
            this.bar.fillStyle(0x00ff00);
        } else if(this.value >= 60 && this.value < 80){
            this.bar.fillStyle(0x7fff00);
        } else if(this.value >= 40 && this.value < 60){
            this.bar.fillStyle(0xffff00);
        } else if(this.value >= 20 && this.value < 40){
            this.bar.fillStyle(0xffa500); //set to orange
        } else {
            this.bar.fillStyle(0xff0000);
        }

        var d = Math.floor(this.ratio * this.value);

        this.bar.fillRect(this.x , this.y,  d, this.height);
    }
}