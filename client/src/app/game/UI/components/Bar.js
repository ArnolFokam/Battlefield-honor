export default class Bar {
    constructor({scene, x, y, width, height, fixed}) {

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

    setTo(amount) {
        this.value = amount;

        this.draw();

        return (this.value === 0);
    }

    draw(){
        //will be implemented by the child classes
        return;
    }
}