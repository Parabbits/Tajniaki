import { Component, OnInit, Injector, HostListener } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Role } from './role';
import { PlayerService } from '../playerService';
import { GameState } from './models/gameState';
import { Card } from './models/card';
import { TooltipCreator } from './tooltip_creator';
import { GameEventsManager } from './gameEventsManager';
import { Team } from '../lobby/team';
import { Player } from '../lobby/lobby_player';
import { GamePlayer } from './models/gamePlayer';
import { Router } from '@angular/router';
import { View } from '../shared/view';
import { GameService } from '../gameService';
import { BossWord } from './models/boss-word';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent extends View implements OnInit  {

  team = Team;
  role = Role;
  private _tooltip: TooltipCreator = new TooltipCreator();
  private _eventsManager: GameEventsManager;
  private _bluePlayers: Player[];
  private _redPlayers: Player[];
  private _bossWord: BossWord = new BossWord();

  public get state(){return this._state;}
  public get tooltip() {return this._tooltip;}
  public get eventsManager(){return this.eventsManager;}
  public get bluePlayers(){return this._bluePlayers;}
  public get redPlayers(){return this._redPlayers;}
  public get bossWord():BossWord {return this._bossWord;}


  constructor(private router:Router, private injector: Injector,
    private gameService: GameService, private playerService: PlayerService,
    private _state: GameState) {
    super();
    this._eventsManager = new GameEventsManager(gameService, playerService, this.state);
   }

  ngOnInit(): void {
    this.preventRightClickMenu();
    this._eventsManager.init(this._state, this.router, this.injector);
    this._eventsManager.sendStartMessage();
    this.setOnLeave(this.onLeaveEvent);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeunload(event){
    if(ConnectionService.isConnected()){
      event.returnValue = "Czy na pewno wyjść?";
    } else {
      event.returnValue = false;
    }
  }

  private onLeaveEvent(){
    this._eventsManager.unsubscribeAll();
    this._eventsManager.closeDialog();
  }

  private preventRightClickMenu() {
    document.addEventListener('contextmenu', event => event.preventDefault());
  }

  isBoss(){
    return this.playerService.getRole()==Role.BOSS;
  }

  isPlayerBoss(player:GamePlayer){
    return player.role == Role.BOSS;
  }

  getClientTeam(){
    return this.playerService.getTeam();
  }

  getOppositeTeam(team:Team){
    return team==Team.BLUE? Team.RED : Team.BLUE;
  }

  getClientRole(){
    return this.playerService.getRole();
  }

  preventWhispace(event)
  {
    if (event.keyCode === 32){
      event.preventDefault();
    }
  }

  isAnswerByClient(card:Card){
    return card.answers.includes(this.playerService.getId());
  }

  isFlagByClient(card: Card){
    return card.flags.includes(this.playerService.getId());
  }

  isWordHidden(card: Card){
    return card.checked && this.playerService.getRole() == Role.BOSS;
  }

  getNickname(){
    return this.playerService.getNickname();
  }

  getRole(){
    return this.playerService.getRole();
  }

  getTeam(){
    return this.playerService.getTeam();
  }

  getFirstTeamPlayers(){
    if(this.playerService.getTeam() == Team.BLUE){
      return this._state.bluePlayers;
    } else if (this.playerService.getTeam()==Team.RED){
      return this._state.redPlayers;
    }
  }

  getSecondTeamPlayers(){
    if(this.playerService.getTeam() == Team.RED){
      return this._state.bluePlayers;
    } else if (this.playerService.getTeam()==Team.BLUE){
      return this._state.redPlayers;
    }
  }

  isPlayerAnswer(player:GamePlayer){
    let cards: Card[] = this._state.getCardsWithPassCard();
    for(let i=0; i< cards.length; i++){
      let card = cards[i];
      for(let j=0; j< card.answers.length; j++){
        let answer = card.answers[j];
        if(answer == player.id){
          return true;
        }
      }
    }
    return false;
  }

  isCurrentPlayer(player:GamePlayer){
    return player.team == this._state.currentTeam && player.role == this._state.currentStage;
  }

  isPlayerTurn(){
    return this.playerService.getTeam() == this._state.currentTeam
      && this.playerService.getRole() == this._state.currentStage;
  }

  getRemainingWordsInPlayerTeam(){
    return this.playerService.getTeam() == Team.BLUE? this._state.remainingBlue : this._state.remainingRed;
  }

  getRemainingsCollection(number:number){
    let result = [];
    for(let i=0; i<number; i++){
      result.push(i);
    }
    return result;
  }

  getRemainings(team:Team){
    return team==Team.BLUE ? this._state.remainingBlue: this._state.remainingRed;
  }

  public sendBossMessage(){
    let word = this.bossWord.word;
    let number = this.bossWord.number;
    this.eventsManager.sendBossMessage(word, number);
    this.bossWord.word = "";
    this.bossWord.number = 1;
  }

}
