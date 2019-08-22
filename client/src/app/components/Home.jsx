import React from "react";
import { Link } from "react-router-dom";
import "./../stylesheets/app.scss";
import "./../stylesheets/pages/home.scss";


import { connect } from 'react-redux';
import * as playerAction from './../actions/playerAction';


function mapDispatchToProps(dispatch) {
  return {
    setPlayerName: name => dispatch(playerAction.setPlayerName(name))
  };
}

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    player: state.player
  }
}

class Home extends React.Component {

  constructor(props){
    super(props);
    this.state = { name: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this)
  }


  handleClick(){
    let name;

    if(isNaN(this.state.name)){
      name =  this.state.name;
    } else {
      name = "Commando" + this.state.name;
    }

    let player_name = name;

    this.props.setPlayerName(player_name);
    this.props.history.push('/play');
  }

  handleChange(event){
    this.setState({ name: event.target.value });
  }

  UNSAFE_componentWillMount(){
    if(this.props.player.name){
      window.location.reload(false);
    }
  }

 render() {
  return (
  	<div id="home">
  		<div className="overlay"></div>
  		<div className="header">
  			<h1>Battlefield honor.</h1>
        	<h2>revive the soldier in you</h2>
  		</div>
      <div className="play_form_container">
        <div className="play_form row">
          <div className="name">
            <input 
              type="text" 
              className="form-control" 
              maxLength="20"  
              name="name" 
              placeholder="Commando Name"
              value={this.state.name}
              onChange={this.handleChange}
              className=""/>
          </div>
          <div className="play">
            <button onClick={this.handleClick} className="btn">Play</button>
          </div>
        </div>
      </div>
        <div className="container row justify-content-between about">
         <div className="col-md-4 col-xs-6"> 
          <h2>About game</h2>   
          <p><span>Battlefield honor</span> is a game inspired by some popular online 2d top down shooter game.</p>
          <p>Right now, the goal is to survive and make as many kills as you can but we are planning to make it more fun by adding a
          team battle party and more. So stay in touch.</p>         
        </div>
        <div className="col-md-4 col-xs-6 how-to"> 
          <h2>How to play</h2>
          <ul>
            <li>Use arrow keys for displacement</li>
            <li>Click the mouse to shoot</li>
            <li>The position of the mouse gives the orientation of the player</li>
            <li>Bring your freinds and enjoy </li>
          </ul>
        </div>
      </div>
    </div>
  );
 }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)