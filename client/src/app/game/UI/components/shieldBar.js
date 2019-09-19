import Bar from "./Bar.js";

export default class ShieldBar extends Bar{
    constructor(props) {
        super(props);

        this.value = 0;
        this.ratio = this.width / 50;

        this.draw();
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x - (this.border.size / 2), this.y - (this.border.size / 2), this.width + this.border.size, this.height + this.border.size);

        // Shield
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        
        this.bar.fillStyle(0x6a97bf);

        var d = Math.floor(this.ratio * this.value);

        this.bar.fillRect(this.x, this.y, d, this.height);
    }
}