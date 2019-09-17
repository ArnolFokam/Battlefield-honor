import Bar from "./Bar.js";

export default class HealthBar extends Bar{
    constructor(props) {
        super(props);
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x - (this.border.size / 2), this.y - (this.border.size / 2), this.width + this.border.size, this.height + this.border.size);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        if (this.value >= 80 && this.value <= 100) {
            this.bar.fillStyle(0x00ff00);
        } else if (this.value >= 60 && this.value < 80) {
            this.bar.fillStyle(0x7fff00);
        } else if (this.value >= 40 && this.value < 60) {
            this.bar.fillStyle(0xffff00);
        } else if (this.value >= 20 && this.value < 40) {
            this.bar.fillStyle(0xff7f00); //set to orange
        } else {
            this.bar.fillStyle(0xff0000);
        }

        var d = Math.floor(this.ratio * this.value);

        this.bar.fillRect(this.x, this.y, d, this.height);
    }
}