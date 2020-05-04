import { ConnectionService } from '../connection.service';
import { LobbyModel } from './lobbyModel';
import { PlayerService } from '../playerService';
import { ConnectionPath } from '../shared/connectionPath';
import { Player } from './lobby_player';
import { Team } from './team';
import { GameService } from '../gameService';
import { Router } from '@angular/router';
import { PlayerAdapter } from '../shared/adapters/playerAdapter';

export class LobbyEventsManager{
    
    private model: LobbyModel;

    public constructor(private router:Router){

    }

    public init(model:LobbyModel){
        this.model = model;
        
        this.subscribeJoinToLobbyResponse();
        this.subscribePlayerConnect();
        this.subscribeChangeTeam();
        this.subscribeReady();
        this.subscribeEndLobby();
        this.subscribeDisconnect();
        this.subscribeOnCloseEvent();
    }

    private subscribeOnCloseEvent(){
        ConnectionService.setOnCloseEvent(()=>{
            alert("Nastąpiło rozłączenie ze serwerem");
            this.router.navigate(['mainmenu']); 
        });
    }

    private subscribeDisconnect(){
        ConnectionService.subscribe(ConnectionPath.DISCONNECT_RESPONSE, message=>{
            let data = JSON.parse(message.body);
            let player = PlayerAdapter.createPlayer(data);
            this.model.removePlayer(this.model.getPlayerById(player.id));
        });
    }

    private subscribeEndLobby() {
        ConnectionService.subscribe(ConnectionPath.LOBBY_END_RESPONSE, message => {
            // TODO: uruchamianie kolejnego ekranu
            console.log("Rozpoczynamy grę");
        });
    }

    private subscribeReady() {
        ConnectionService.subscribe(ConnectionPath.READY_RESPONSE, message => this.setPlayerReady(message));
    }

    private setPlayerReady(message: any) {
        var data = JSON.parse(message.body);
        let player = this.model.getPlayerById(data["playerId"]);
        player.ready = data['ready'];
    }

    private subscribeChangeTeam() {
        ConnectionService.subscribe(ConnectionPath.CHANGE_TEAM_REPONSE, message => this.setPlayerTeam(message));
    }

    private setPlayerTeam(message: any) {
        var json = JSON.parse(message.body);
        console.log(json);
        var player = this.model.getPlayerById(json['id']);
        player.team = this.getTeam(json['team']);
    }

    private subscribePlayerConnect() {
        ConnectionService.subscribe(ConnectionPath.CONNECT_RESPONSE, message => {
            let data = JSON.parse(message.body);
            let newPlayer = PlayerAdapter.createPlayer(data);
            this.model.addPlayer(newPlayer);
        });
    }

    private subscribeJoinToLobbyResponse() {
        ConnectionService.subscribe(ConnectionPath.PLAYERS_RESPONSE, (message) => {
            var data = JSON.parse(message.body);
            this.setSettings(data['settings']);
            this.setPlayers(data['players']);
        });
    }

    private getTeam(teamText:string):Team{
        switch(teamText){
          case "RED":
            return Team.RED;
          case "BLUE":
            return Team.BLUE;
          case "OBSERVER":
            return Team.OBSERVER;
        }
    }

    private setSettings(settings): void {
        let maxTeamSize = settings['maxTeamSize'];
        GameService.setMaxTeamSize(maxTeamSize);
    }

    private setPlayers(players):void{
        players.forEach(playerElement => {
            var player = PlayerAdapter.createPlayer(playerElement);
            this.model.addPlayer(player);
            if (this.isClientPlayer(player)){
                this.model.setClientPlayer(player);
            };
        });
    }


    private isClientPlayer(player:Player):boolean{
        // TODO: zastanwoić się, co zrobić w sytuacji, w której więcej graczy ustawi sobie ten sam nick
        // TODO: zrobić to za pomocą 
        return player.nickname == PlayerService.getNickname();
    }

    public sendReady(){
        ConnectionService.send(!this.model.getClientPlayer().ready, ConnectionPath.READY);
    }

    public sendJoinBlue(){
        ConnectionService.send(Team.BLUE, ConnectionPath.CHANGE_TEAM);
    }

    public sendJoinRed(){
        ConnectionService.send(Team.RED, ConnectionPath.CHANGE_TEAM);
    }

    public sendJoinToLobby(){
        ConnectionService.send(PlayerService.getNickname(), ConnectionPath.CONNECT);
    }
}