import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConnectionService } from '../connection.service';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogService } from '../dialog/dialog.service';
import { DialogMode } from '../dialog/dialogMode';
import { GameComponent } from '../game/game.component';
import { GameService } from '../gameService';
import { LobbyComponent } from '../lobby/lobby.component';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { IdParam } from '../shared/parameters/id.param';
import { ChangeStateType, ViewComponent } from '../shared/view-component';
import { SummaryComponent } from '../summary/summary.component';
import { VotingComponent } from '../voting/voting.component';
import { State } from './state';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, AfterViewInit {

  public state = State;

  @ViewChild(MainMenuComponent)
  private mainMenuComponent: MainMenuComponent;

  @ViewChild(LobbyComponent)
  private lobbyComponent: LobbyComponent;

  @ViewChild(VotingComponent)
  private votingComponent: VotingComponent;

  @ViewChild(GameComponent)
  private gameComponent: GameComponent;

  @ViewChild(SummaryComponent)
  private summaryComponent: SummaryComponent;

  private _currentState: State;
  private componentsMap: Map<State, ViewComponent>;
  private statesOrder: State[];
  private currentStateIndex: number;

  private menuOpen = false;

  constructor(private connectionService: ConnectionService, private dialog: DialogService, private gameService: GameService) {}
  ngAfterViewInit(): void {
    this._currentState = State.MAIN_MENU;
    this.componentsMap = this.initComponentsMap();
    let component = this.getComponent(this._currentState);
    component.init();
  }

  ngOnInit(): void {
    this.preventRightClickMenu();
    this.statesOrder = this.initStatesOrder();
    this.currentStateIndex = 0;
  }

  private initComponentsMap(): Map<State, ViewComponent> {
    let map = new Map();
    map.set(State.MAIN_MENU, this.mainMenuComponent);
    map.set(State.LOBBY, this.lobbyComponent);
    map.set(State.VOTING, this.votingComponent);
    map.set(State.GAME, this.gameComponent);
    map.set(State.SUMMARY, this.summaryComponent);
    return map;
  }

  private initStatesOrder() {
    return [
      State.MAIN_MENU,
      State.LOBBY,
      State.VOTING,
      State.GAME,
      State.SUMMARY,
    ];
  }

  private preventRightClickMenu() {
    document.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  public isCurrentState(state: State) {
    return this._currentState == state;
  }

  public onStateChange(type: ChangeStateType) {
    switch (type) {
      case ChangeStateType.NEXT_STATE:
        this.runNextState();
        break;
      case ChangeStateType.DISCONNECT:
        this.goToState(State.MAIN_MENU);
        break;
      case ChangeStateType.INTERRUPT_GAME:
        this.goToState(State.MAIN_MENU);
    }
  }

  private runNextState() {
    let nextState = this.getNextState();
    this.runState(nextState);
  }

  public goToState(state: State) {
    this.menuOpen = false;
    this.currentStateIndex = this.statesOrder.findIndex(x => x == state);
    this.runState(state);
  }

  private runState(state: State) {
    let currentComponent = this.getComponent(this._currentState);
    currentComponent.close();
    let nextComponent = this.getComponent(state);
    nextComponent.init();
    this._currentState = state;
  }

  private getNextState(): State {
    this.currentStateIndex++;
    if (this.currentStateIndex >= this.statesOrder.length) {
      this.currentStateIndex = 0;
    }
    return this.statesOrder[this.currentStateIndex];
  }

  private getComponent(state: State): ViewComponent {
    return this.componentsMap.get(state);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeunload(event) {
    if (this.connectionService.isConnected()) {
      event.returnValue = 'Czy na pewno wyjść?';
    } else {
      event.returnValue = false;
    }
  }

  public isMenuOpen():boolean{
    return this.menuOpen;
  }

  public isMenuVisible():boolean{
    return this._currentState != State.MAIN_MENU;
  }

  public openMenu(){
    this.menuOpen = true;
  }

  public onGoToMainMenuClick(){
    this.dialog.setMessage("dialog.sure_quit").setMode(DialogMode.ALERT)
    .setOnOkClick(()=>this.onOkGoToMenuClick())
    .setOnCancelClick(()=>{this.menuOpen = false;})
    .open(DialogComponent);
  }

  private onOkGoToMenuClick(){
    let param = new IdParam(this.gameService.getId());
    let json = JSON.stringify(param);
    this.connectionService.send(json, '/app/game/quit');
    this.dialog.close();
    this.goToState(State.MAIN_MENU);
  }
}
