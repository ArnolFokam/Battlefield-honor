const colyseus = require('colyseus')
const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
//const ArraySchema = schema.ArraySchema;
const type = schema.type;

class Player extends Schema {
    constructor() {
        super();
        this.shield = 0;
    }
}
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "rotation");
type("number")(Player.prototype, "health");
type("string")(Player.prototype, "name");
type("number")(Player.prototype, "num_bullets");
type("number")(Player.prototype, "kills");
type("number")(Player.prototype, "alpha");

class Bullet extends Schema {}
type("number")(Bullet.prototype, "x");
type("number")(Bullet.prototype, "y");
type("number")(Bullet.prototype, "angle");
type("number")(Bullet.prototype, "speed_x");
type("number")(Bullet.prototype, "speed_y");
type("number")(Bullet.prototype, "first_collision_x");
type("number")(Bullet.prototype, "first_collision_y");
type("number")(Bullet.prototype, "index");



class State extends Schema {
    constructor() {
        super();

        let mapSizes = [3200, 4800, 3840];

        this.players = new MapSchema();
        this.bullets = new MapSchema();
        this.nextPosition = 0;
        this.bullet_index = 0;
        this.players_online = 0;
        this.killsList = [];
        this.mapNum = Math.floor(Math.random() * 4);
        this.mapSize = mapSizes[this.mapNum];
    }

    getNextPosition() {
        let position = (this.nextPosition % 4) + 1;
        ++this.nextPosition;
        return position;
    }

    createBullet(id, data) {
        let bullet = new Bullet();
        bullet.index = this.bullet_index;
        bullet.x = data.x;
        bullet.y = data.y;
        bullet.angle = data.angle;
        bullet.speed_x = data.speed_x;
        bullet.speed_y = data.speed_y;
        bullet.first_collision_x = data.first_collision_x;
        bullet.first_collision_y = data.first_collision_y;
        bullet.distanceTravelled = 0;
        bullet.owner_id = id;
        this.players[id].num_bullets -= 1;
        this.bullets[this.bullet_index++] = bullet;
    }

    moveBullet(index) {
        let old_x = this.bullets[index].x;
        let old_y = this.bullets[index].y;

        this.bullets[index].x -= this.bullets[index].speed_x;
        this.bullets[index].y -= this.bullets[index].speed_y;

        let dx = this.bullets[index].x - old_x;
        let dy = this.bullets[index].y - old_y;

        this.bullets[index].distanceTravelled += Math.sqrt(dx * dx + dy * dy);
    }

    removeBullet(index) {
        delete this.bullets[index];
    }



    createPlayer(id, name) {
        this.players[id] = new Player();
        this.players[id].health = 100;
        this.players[id].name = name.toString();
        this.players_online = this.players_online + 1;
        this.players[id].num_bullets = 20;
        this.players[id].kills = 0;
        this.players[id].alpha = 1.0;
    }

    getPlayer(id) {
        return this.players[id];
    }

    removePlayer(id) {
        delete this.players[id];
        this.players_online = this.players_online - 1, 0;
    }

    setPlayerPosition(id, position) {
        this.players[id].x = position.x;
        this.players[id].y = position.y;
    }

    getPlayerHealth(id) {
        return this.players[id].health
    }

    movePlayer(id, movement) {
        let player = this.players[id];
        player.x = movement.x;
        player.y = movement.y;
        player.rotation = movement.rotation
    }

    damagePlayer(id, damage) {
        let real_damage = Math.abs(Math.min(0, this.players[id].shield - damage));
        this.players[id].health = Math.max(0, this.players[id].health - real_damage);
        this.players[id].shield = Math.max(0, this.players[id].shield - damage);
    }

    healPlayer(id, healing) {
        this.players[id].health = Math.min(100, this.players[id].health + healing);
    }

}


schema.defineTypes(State, {
    players: {
        map: Player
    }
});

schema.defineTypes(State, {
    bullets: {
        map: Bullet
    }
});

exports.outdoor = class extends colyseus.Room {

    onInit() {
        this.setState(new State());
        this.clock.setInterval(this.ServerGameLoop.bind(this), 16);
    }

    onJoin(client, options) {

        this.send(client, {
            event: "map_num",
            mapNum: this.state.mapNum,
            players_online: this.state.players_online,
        });

        let nextPosition = this.state.getNextPosition();

        this.state.createPlayer(client.sessionId, options.name);

        this.state.killsList.push({
            name: options.name,
            kills: 0
        });

        this.send(client, {
            event: "start_position",
            position: nextPosition,
            players_online: this.state.players_online,
            num_bullets: this.state.players[client.sessionId].num_bullets,
            killsList: this.state.killsList
        });

        this.broadcast({
            event: "new_player",
            position: nextPosition,
            name: options.name,
            id: client.sessionId
        }, {
            except: client
        });

        this.broadcast({
            event: "players_online",
            number: this.state.players_online
        }, {
            except: client
        });

        this.broadcast({
            event: "leaderboard",
            killsList: this.state.killsList
        }, {
            except: client
        });

    }

    onMessage(client, message) {
        switch (message.action) {

            case "initial_position":
                if (this.state.getPlayer(client.sessionId) == undefined) return; // Happens if the server restarts and a client is still connected
                this.state.setPlayerPosition(client.sessionId, message.data);
                break;

            case "move":
                if (this.state.getPlayer(client.sessionId) == undefined) return;
                this.state.movePlayer(client.sessionId, message.data);
                break;

            case "shoot_bullet":
                if (this.state.getPlayer(client.sessionId) == undefined) return;
                if (Math.abs(message.data.speed_x) <= 100 && Math.abs(message.data.speed_y) <= 100 && this.state.players[client.sessionId].num_bullets > 0) {
                    this.state.createBullet(client.sessionId, message.data);
                }
                break;

            case "reload":
                if (this.state.getPlayer(client.sessionId) == undefined) return;
                this.state.players[client.sessionId].num_bullets = 20;
                this.send(client, {
                    event: "reloading"
                });
                break;

            case "activate_powerup":
                this.activatePowerup(message.data, client.sessionId);
                break;

            default:
                console.log(message.action + " is an unknown action");
                break;
        }
    }
    onLeave(client, consented) {
        if (this.state.getPlayer(client.sessionId)) {
            this.state.removePlayer(client.sessionId);
            this.broadcast({
                event: "players_online",
                number: this.state.players_online
            });
        }

        this.state.killsList.length = 0;
        for (let id in this.state.players) {
            this.state.killsList.push({
                name: this.state.players[id].name,
                kills: this.state.players[id].kills
            });
        }
        this.state.killsList.sort((a, b) => (a.kills < b.kills) ? 1 : (a.kills === b.kills) ? ((a.name > b.name) ? 1 : -1) : -1);
        this.broadcast({
            event: "leaderboard",
            killsList: this.state.killsList
        });
    }

    onDispose() {}

    activatePowerup(powerup, player_id) {
        switch (powerup) {
            case "health":
                this.state.healPlayer(player_id, 20);
                this.send(this.getClientById(player_id), {
                    event: "health_changed",
                    health: this.state.getPlayerHealth(player_id)
                });
                break;

            case "shield":
                this.state.getPlayer(player_id).shield = Math.min(50, this.state.getPlayer(player_id).shield + 25);
                this.send(this.getClientById(player_id), {
                    event: "shield_changed",
                    shield: this.state.getPlayer(player_id).shield
                });
                break;

            case "blink":
                this.state.getPlayer(player_id).alpha = 0;
                this.clock.setTimeout(() => {
                    this.state.getPlayer(player_id).alpha = 1.0;
                }, 10000);
                break;

            default:
                break;
        }
    }

    // Update the bullets 60 times per frame and send updates 
    ServerGameLoop() {
        for (let i in this.state.bullets) {
            this.state.moveBullet(i);
            //remove the bullet if it goes too far
            if (this.state.bullets[i].x < -10 || this.state.bullets[i].x > this.state.mapSize || this.state.bullets[i].y < -10 || this.state.bullets[i].y > this.state.mapSize || this.state.bullets[i].distanceTravelled >= 600 || (this.state.bullets[i].x == this.state.bullets[i].first_collision_x && this.state.bullets[i].y == this.state.bullets[i].first_collision_y)) {
                this.state.removeBullet(i);
            } else {
                //check if this bullet is close enough to hit a player
                for (let id in this.state.players) {
                    if (this.state.bullets[i].owner_id != id) {
                        //because your own bullet shouldn't kill hit
                        let dx = this.state.players[id].x - this.state.bullets[i].x;
                        let dy = this.state.players[id].y - this.state.bullets[i].y;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 30) {
                            this.state.damagePlayer(id, 10)
                            this.broadcast({
                                event: "hit",
                                punished: {
                                    id: id,
                                    health: this.state.getPlayerHealth(id)
                                },
                                punisher_id: this.state.bullets[i].owner_id
                            });

                            this.send(this.getClientById(id), {
                                event: "shield_changed",
                                shield: this.state.getPlayer(id).shield
                            });

                            if (this.state.getPlayerHealth(id) <= 0) {
                                this.send(this.getClientById(id), {
                                    event: "dead"
                                });

                                this.send(this.getClientById(this.state.bullets[i].owner_id), {
                                    event: "good_shot"
                                });

                                //if the player's bullet hit somebody and he died before
                                if (this.state.bullets[i].owner_id) {
                                    this.state.players[this.state.bullets[i].owner_id].kills += 1;

                                    this.state.removePlayer(id);
                                    this.broadcast({
                                        event: "players_online",
                                        number: this.state.players_online
                                    });

                                    this.state.killsList.length = 0;
                                    for (let id in this.state.players) {
                                        this.state.killsList.push({
                                            name: this.state.players[id].name,
                                            kills: this.state.players[id].kills
                                        });
                                    }

                                    this.state.killsList.sort((a, b) => (a.kills < b.kills) ? 1 : (a.kills === b.kills) ? ((a.name > b.name) ? 1 : -1) : -1);
                                    this.broadcast({
                                        event: "leaderboard",
                                        killsList: this.state.killsList
                                    });
                                }

                            }
                            this.state.removeBullet(i);
                            return;
                        }
                    }
                }
            }
        }
    }

    getClientById(id) {
        //find a client has id equal with test's  id
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].sessionId == id) {
                return this.clients[i];
            }
        }
        return;
    }
}