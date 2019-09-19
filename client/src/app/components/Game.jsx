import React from "react";
import Phaser from "phaser";
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';


import LoadingScene from "../game/scenes/Loading";
import PlayScene from "../game/scenes/Play";
import HUDScene from "../game/scenes/HUD";
import GameOverScene from "../game/scenes/GameOver";

import "./../stylesheets/pages/game.scss";


const mapStateToProps = (state /*, ownProps*/) => {
  return {
    player: state.player
  }
}

class Game extends React.Component {

  constructor(props){
    super(props);

    this.state = {game: null};
  }

  componentDidMount() {
    if(this.props.player.name){
      let ratio = 9/16;
      let GAME_WIDTH = 1280;
      let GAME_HEIGHT = Math.floor(GAME_WIDTH * ratio);

      const config = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        parent: "root",
        physics: {
            default: 'arcade',
            arcade: {
                debug:false
            }
        },
        scene: [ LoadingScene, PlayScene, HUDScene, GameOverScene ]
      }

       let game = new Phaser.Game(config);
       game.scene.start("load", { name: this.props.player.name });
       this.setState({game: game}); 
    }
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount(){
    if(this.state.game){
      this.state.game.destroy(true);//if we reload the page or go to another page?? destroy the current game
    }
  }

  render() {
  	return ( this.props.player.name == undefined ? <Redirect to="/"/> : null);
  }
}

export default connect(mapStateToProps, null)(Game)