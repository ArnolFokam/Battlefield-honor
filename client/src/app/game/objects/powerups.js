import Phaser from "phaser";


export default class Powerups  {
	constructor(props){
		this.items = {
			"health": 0,
			"shield": 0,
			"blink": 0
		}

		this.scene = props.scene;


	}

	useItem(item){
		if(this.items[item] == 0) {
			return false;
		}

		switch(item){
			case "health":
			this.scene.room.send({
				action: "activate_powerup",
			 	data:"health"
			 });
			break;

			case "shield":
			this.scene.room.send({
				action: "activate_powerup",
			 	data:"shield"
			 });
			break;

			case "blink":
			this.scene.room.send({
				action: "activate_powerup",
			 	data:"blink"
			});
			break;

			default:
			console.log("unkonwn " + item + " used");
		}

		this.items[item] -= 1;

		this.scene.events.emit("item_changed", this.items);
	}

	collectItem(item){
		this.items[item] += 1;

		this.scene.events.emit("item_changed", this.items);
	}


}