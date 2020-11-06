import { Component, OnInit, Injector} from '@angular/core';
import {Team} from './team';
import { LobbyModel } from './lobbyModel';
import { LobbyEventsManager } from './lobbyEventManager';
import { ConnectionService } from '../connection.service';
import { ConnectionPath } from '../shared/connectionPath';
import { Router } from '@angular/router';
import { View as ViewComponent } from '../shared/view';
import {PlayerService} from "../playerService";
import { AppService, GameStep } from '../shared/appService';
import { GameService } from '../gameService';
import { IdParam } from '../shared/parameters/id.param';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent extends ViewComponent implements OnInit {

  team = Team;
  model: LobbyModel = new LobbyModel();
  eventsManager: LobbyEventsManager;

  constructor(private router:Router, private injector: Injector) {
    super();
    this.eventsManager = new LobbyEventsManager(router, injector);
  }

  ngOnInit(): void {
    AppService.setCurrentStep(GameStep.LOBBY);
    this.eventsManager.init(this.model);
    this.eventsManager.sendJoinToLobby();
    this.setOnLeave(this.onLeaveEvent);
  }

  private onLeaveEvent(){
    this.eventsManager.unsubscribeAll();
    this.eventsManager.closeDialog();
  }

  isBlue(player){
    return player.team==Team.BLUE;
  }

  isRed(player){
    return player.team == Team.RED;
  }

  isObserver(player){
    return player.team == Team.LACK;
  }

  countBlue(){
    return this.model.getPlayers(Team.BLUE).length;
  }

  countRed(){
    return this.model.getPlayers(Team.RED).length;
  }

  countObserver(){
    return this.model.getPlayers(Team.LACK).length;
  }

  isPlayerReady(){
    return this.model.getClientPlayer().ready;
  }

  canJoinToBlue(){
    return this.countBlue() < this.model.getMaxPlayersInTeam();
  }

  canJoinToRed(){
    return this.countRed() < this.model.getMaxPlayersInTeam();
  }

  canSetReady(){
    return this.model.getClientPlayer().team == Team.BLUE || this.model.getClientPlayer().team == Team.RED;
  }

  getNickname(){
    return PlayerService.getNickname();
  }

  getTeam(){
    return PlayerService.getTeam();
  }
}
