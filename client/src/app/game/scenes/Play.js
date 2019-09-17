import Phaser from "phaser";
import {
    mobileAndTabletcheck
} from "./../../utils/utils.js";
import Powerups from "./../objects/powerups.js"
import * as Colyseus from "colyseus.js";



//const endpoint = (window.location.hostname === "localhost") ? `ws://localhost:${process.env.PORT}` : `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}:${process.env.PORT}`;

//for heroku remote deployment...to run it locally comment the code below and uncomment the code at the top
const endpoint = (window.location.protocol === "http:") ? `ws://${process.env.APP_URL}` : `wss://${process.env.APP_URL}`



export default class PlayScene extends Phaser.Scene {

    bullets = {}; //when declare outside a function, they are treated as private properties of the class and are accessed with this.[property name]
    players = {};
    player = {
        name: ""
    };
    roomJoined = false;
    room = null;
    closingMessage = "You have been disconnected from the server";

    lastFired = 0;
    shootingRate = 100;
    RKey;
    isReloading = false;
    bulletsBefore = 0;

    maps = [];
    mapReceived = false;
    mapSizes = [];
    mapSize;

    constructor() {
        super("play");
        this.gameDepth = {
            player: 1,
            herbe: 2,
            HUD: 3
        }
        this.mapReceived = false;
        this.maps = ["map", "map1", "map2"];
        this.mapSizes = [3200, 4800, 3840];
        this.mapSize = 3200;
        this.client = new Colyseus.Client(endpoint);
    }

    init(params) {
        this.scale.lockOrientation("landscape");
        this.player.name = params.name;
        this.map;
    }

    preload() {}

    create() {

        this.backgroundMusic = this.sound.add('backgroundMusic');
        //this.backgroundMusic.setLoop(true).play();

        this.bulletSound = this.sound.add('bulletSound');
        this.noBullets = this.sound.add('noBullets');
        this.gunReload = this.sound.add('gunReload');

        this.input.setDefaultCursor('crosshair');

        this.connect();

        if (mobileAndTabletcheck()) {
            this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                y: window.innerHeight * (9 / 10) - 50,
                x: window.innerWidth * (1.5 / 10) + 25,
                radius: 50,
                base: this.add.graphics().fillStyle(0x888888).fillCircle(0, 0, 50).setDepth(this.gameDepth.HUD).setAlpha(0.4),
                thumb: this.add.graphics().fillStyle(0xcccccc).fillCircle(0, 0, 25).setDepth(this.gameDepth.HUD).setAlpha(0.4),
                // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
                // forceMin: 16,
                // enable: true
            });

            this.joyStick.setScrollFactor(0);

            this.joystickCursors = this.joyStick.createCursorKeys();
            this.dumpJoyStickState();

            this.buttonA = this.add.image(window.innerWidth * (9 / 10) - 50, window.innerHeight * (9 / 10) - 50, "button").setInteractive();
            this.buttonA.setScrollFactor(0).setDepth(this.gameDepth.HUD).setScale(2);

        } else {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.RKey = this.input.keyboard.addKey('R');
        }

        this.powerups = new Powerups({ scene: this });

        let HUDScene = this.scene.get('HUD');
        HUDScene.events.on("reload_finished", function() {
            this.isReloading = false;
        }, this);

        this.test1 = this.physics.add.image( 200, 200, "healthPowerup").setDepth(this.gameDepth.player);
        this.test1.type = "health";

        this.test2 = this.physics.add.image( 150, 200, "shieldPowerup").setDepth(this.gameDepth.player);
        this.test2.type = "shield";

        this.test3 = this.physics.add.image( 280, 240, "blinkPowerup").setDepth(this.gameDepth.player);
        this.test3.type = "blink";
    }

    connect() {
        var self = this;
        let name = "";

        this.room = this.client.join("outdoor", {
            name: self.player.name
        });


        this.room.onJoin.add(() => {

            self.roomJoined = true;

            this.room.onStateChange.addOnce((state) => {

                // Loop over all the player data received
                for (let id in state.players) {
                    // If the player hasn't been created yet
                    if (self.players[id] == undefined && id != this.room.sessionId) { // Make sure you don't create yourself
                        let data = state.players[id];
                        self.addPlayer({
                            id: id,
                            x: data.x,
                            y: data.y,
                            rotation: data.rotation || 0,
                            name: data.name
                        });

                        let player_sprite = self.players[id].sprite;
                        player_sprite.target_x = state.players[id].x; // Update target, not actual position, so we can interpolate
                        player_sprite.target_y = state.players[id].y;
                        player_sprite.target_rotation = (state.players[id].rotation || 0);
                    }

                }
            });

            this.room.state.players.onAdd = (player, sessionId) => {
                //to prevent the player from recieving a message when he is the new player added

                if (sessionId != this.room.sessionId) {
                    // If you want to track changes on a child object inside a map, this is a common pattern:
                    player.onChange = function(changes) {
                        changes.forEach(change => {
                            if (change.field == "rotation") {
                                self.players[sessionId].sprite.target_rotation = change.value;
                            } else if (change.field == "x") {
                                self.players[sessionId].sprite.target_x = change.value;
                            } else if (change.field == "y") {
                                self.players[sessionId].sprite.target_y = change.value;
                            }
                        });
                    };

                } else {
                    player.onChange = function(changes) {
                        changes.forEach(change => {
                            if (change.field == "num_bullets") {
                                self.player.num_bullets = change.value;
                                if (!self.isReloading) {
                                    self.events.emit("bullets_num_changed", self.player.num_bullets);
                                }
                            }
                        });
                    };
                }
            }

            this.room.state.bullets.onAdd = (bullet, sessionId) => {
                self.bullets[bullet.index] = self.physics.add.sprite(bullet.x, bullet.y, 'bullet').setRotation(bullet.angle);
                this.bulletSound.play();

                // If you want to track changes on a child object inside a map, this is a common pattern:
                bullet.onChange = function(changes) {
                    changes.forEach(change => {
                        if (change.field == "x") {
                            self.bullets[bullet.index].x = change.value;
                        } else if (change.field == "y") {
                            self.bullets[bullet.index].y = change.value;
                        }
                    });
                };

            }

            this.room.state.bullets.onRemove = function(bullet, sessionId) {
                self.removeBullet(bullet.index);
            }



            this.room.state.players.onRemove = function(player, sessionId) {
                //if the player removed (maybe killed) is not this player
                if (sessionId !== self.room.sessionId) {
                    self.removePlayer(sessionId);
                }
            }
        });

        this.room.onMessage.add((message) => {
            if (message.event == "start_position") {
                let spawnPoint = this.map.findObject("player", obj => obj.name === `player${message.position}`);
                let position = {
                    x: spawnPoint.x,
                    y: spawnPoint.y,
                }

                self.scene.launch("HUD", {
                    name: self.player.name,
                    players_online: message.players_online,
                    killsList: message.killsList
                }); //later we need to load dirrent componets of the HUD when its data to display is available


                this.room.send({
                    action: "initial_position",
                    data: position
                });
                
                self.addPlayer({
                    id: this.room.sessionId,
                    x: spawnPoint.x,
                    y: spawnPoint.y,
                    num_bullets: message.num_bullets

                });
            }

             else if (message.event == "new_player") {
                let spawnPoint = this.map.findObject("player", obj => obj.name === `player${message.position}`);
                let p = self.addPlayer({
                    x: spawnPoint.x,
                    y: spawnPoint.y,
                    id: message.id,
                    rotation: message.rotation || 0,
                    name: message.name
                });
            }

             else if (message.event == "hit") {
                if (message.punisher_id == self.room.sessionId) {
                    //self.events.emit("addHits");
                } else if (message.punished.id == self.room.sessionId) {
                    self.events.emit("health_changed", message.punished.health);
                }
            } 

            else if (message.event == "dead") {
                self.closingMessage = "You have been killed.\nTo renter the game, reload the page";
                this.player.sprite.destroy();
                delete this.player;
                alert(self.closingMessage);
                //maybe implement the possibility to the see the game after being killed
            }

             else if (message.event == "good_shot") {
                self.events.emit("addKills");
            } 

            else if (message.event == "players_online") {
                self.events.emit("players_in_game", message.number);
            } 

            else if (message.event == "reloading") {
                this.isReloading = true;
                self.events.emit("reload", self.player.num_bullets);
            } 

            else if (message.event == "leaderboard") {
                self.events.emit("leaderboard", message.killsList);
            } 

            else if (message.event == "map_num") {
                if (!self.mapReceived) {
                    self.mapSize = self.mapSizes[message.mapNum];
                    self.map = self.make.tilemap({
                        key: self.maps[message.mapNum]
                    });

                    const tileset = self.map.addTilesetImage("battle-royale", "tiles");
                    const floorLayer = self.map.createStaticLayer("floor", tileset, 0, 0);

                    if (message.mapNum == 0) {
                        self.map["herbeLayer"] = self.map.createStaticLayer("herbe", tileset, 0, 0).setAlpha(0.8).setDepth(self.gameDepth.herbe);
                    } else if (message.mapNum == 1) {
                        self.map["bordureLayer"] = self.map.createStaticLayer("bordure", tileset, 0, 0);
                    }

                    self.map["blockLayer"] = self.map.createStaticLayer("block", tileset, 0, 0);
                    self.map["blockLayer"].setCollisionByProperty({
                        collide: true
                    });

                    self.cameras.main.setBounds(0, 0, self.map.widthInPixels, self.map.heightInPixels);
                    self.physics.world.setBounds(0, 0, self.map.widthInPixels, self.map.heightInPixels);

                    self.mapReceived = true;
                }
            }

            else if(message.event == "health_changed"){
                self.events.emit("health_changed", message.health);
            }
            else if(message.event == "shield_changed"){
                self.events.emit("shield_changed", message.shield);
            }
            else {
                console.log(`${message} is an unknown message`);
            }
        });

        this.room.onError.add(() => {
            alert(room.sessionId + " couldn't join " + room.name);
        });

    }

    update(time, delta) {

        for (let id in this.players) {
            let p = this.players[id].sprite;
            p.x += ((p.target_x || p.x) - p.x) * 0.5;
            p.y += ((p.target_y || p.x) - p.y) * 0.5;
            this.players[id].name.x = p.x - (p.width / 2);
            this.players[id].name.y = p.y + (p.height / 2);

            // Intepolate angle while avoiding the positive/negative issue 
            let angle = p.target_rotation || p.rotation;
            let dir = (angle - p.rotation) / (Math.PI * 2);
            dir -= Math.round(dir);
            dir = dir * Math.PI * 2;
            p.rotation += dir;
        }

        if (this.player.sprite) {


            this.player.sprite.setVelocity(0);

            if (this.cursors && this.RKey) {
                this.moveMyPlayer();
                this.input.on('pointerdown', function(pointer) {
                    this.shoot(time);
                }, this);

                if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
                    this.room.send({
                        action: "reload"
                    });
                }
            } else {
                this.buttonA.on('pointerdown', function(pointer) {
                    this.shoot(time);
                }, this);

                this.player.sprite.on('pointerdown', function(pointer) {

                    this.room.send({
                        action: "reload"
                    });
                }, this);
            }

            if (this.joyStick) {

                this.dumpJoyStickState();

            }

            this.shot = false;

            if (this.roomJoined) {
                this.room.send({
                    action: "move",
                    data: {
                        x: this.player.sprite.x,
                        y: this.player.sprite.y,
                        rotation: this.player.sprite.rotation
                    }
                });
            }
        }

    }

    addPlayer(data) {
        let id = data.id;
        let sprite = this.physics.add.sprite(data.x, data.y, "player").setSize(60, 80).setScale(0.8).setDepth(this.gameDepth.player);

        if (id == this.room.sessionId) {
            let self = this;
            this.player.sprite = sprite;
            this.player.sprite.setTint("0xff0000");
            this.player.sprite.setCollideWorldBounds(true);
            this.cameras.main.startFollow(this.player.sprite);
            this.physics.add.collider(this.player.sprite, this.map["blockLayer"]);

            this.physics.add.overlap(this.player.sprite, this.test1, ()=> {
                this.powerups.collectItem(this.test1.type);
                this.test1.destroy();
            });

            this.physics.add.overlap(this.player.sprite, this.test2, ()=> {
                this.powerups.collectItem(this.test2.type);
                this.test2.destroy();
            });

            this.physics.add.overlap(this.player.sprite, this.test3, ()=> {
                this.powerups.collectItem(this.test3.type);
                this.test3.destroy();
            });

            this.player.num_bullets = data.num_bullets;
            if(mobileAndTabletcheck()){
                this.player.sprite.setInteractive();
            }
        } else {
            this.players[id] = {};
            this.players[id].sprite = sprite;
            this.players[id].name = this.add.text(this.players[id].sprite.x - (this.players[id].sprite.width / 2), this.players[id].sprite.y + (this.players[id].sprite.height / 2), data.name, {
                fontSize: '16px',
                fill: '#fff'
            }).setOrigin(0, 0);
            this.players[id].name.setDepth(this.gameDepth.player);
            this.players[id].sprite.setRotation(data.rotation);
        }
    }

    moveMyPlayer() {

        if (this.cursors.left.isDown) {
            this.rotatePlayer();
            this.player.sprite.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.rotatePlayer();
            this.player.sprite.setVelocityX(300);
        }

        if (this.cursors.up.isDown) {
            this.rotatePlayer();
            this.player.sprite.setVelocityY(-300);
        } else if (this.cursors.down.isDown) {
            this.rotatePlayer();
            this.player.sprite.setVelocityY(300);
        }

        this.input.on('pointermove', function(pointer) {
            this.rotatePlayer(pointer);
        }, this);
    }

    removePlayer(id) {
        this.players[id].sprite.destroy();
        this.players[id].name.destroy();
        delete this.players[id];
    }

    rotatePlayer(pointer = this.input.activePointer) {
        let player = this.player.sprite;
        let angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY)
        player.setRotation(angle + Math.PI / 2);
    }

    removeBullet(index) {
        this.bullets[index].destroy();
        delete this.bullets[index];
    }

    dumpJoyStickState(pointer = this.input.activePointer) {

        if (this.player.sprite) {

            if (this.joyStick.rotation == 0) {
                return;
            }

            let force = Math.min(this.joyStick.force, 50) / 50;

            this.player.sprite.setRotation(this.joyStick.rotation + (90 * Math.PI / 180));

            if (this.joystickCursors.left.isDown) {

                this.player.sprite.setVelocityX(-300*force);

            } else if (this.joystickCursors.right.isDown) {

                this.player.sprite.setVelocityX(300*force);
            }

            if (this.joystickCursors.up.isDown) {

                this.player.sprite.setVelocityY(-300*force);
            } else if (this.joystickCursors.down.isDown) {

                this.player.sprite.setVelocityY(300*force);
            }
        }

    }

    shoot(time) {top
        if (time > this.lastFired && this.player.num_bullets > 0 && !this.isReloading) {
            if (!this.shot) {

                let speed_x = Math.cos(this.player.sprite.rotation + Math.PI / 2) * 50;
                let speed_y = Math.sin(this.player.sprite.rotation + Math.PI / 2) * 50;

                let x = this.player.sprite.x;
                let y = this.player.sprite.y;
                let distanceTravelled = 0;
                while (!(this.map["blockLayer"].hasTileAtWorldXY(x, y))) {
                    x -= speed_x;
                    y -= speed_y;
                    distanceTravelled += Math.sqrt(speed_x * speed_x + speed_y * speed_y);
                    if (x < -10 || x > this.mapSize || y < -10 || y > this.mapSize || distanceTravelled >= 600) {
                        break;
                    }
                }

                // Tell the server we shot a bullet 
                this.room.send({
                    action: "shoot_bullet",
                    data: {
                        x: this.player.sprite.x,
                        y: this.player.sprite.y,
                        angle: this.player.sprite.rotation,
                        speed_x: speed_x,
                        speed_y: speed_y,
                        first_collision_x: x,
                        first_collision_y: y
                    }
                });

                this.shot = true;

                this.lastFired = time + this.shootingRate;
            }
        } else if (time > this.lastFired && this.player.num_bullets == 0 && !this.isReloading) {
            this.noBullets.play();
            this.lastFired = time + this.shootingRate;
        }
    }

}