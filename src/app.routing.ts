import { Routes, RouterModule, Router } from "@angular/router";
import { MainMenuComponent } from './app/main-menu/main-menu.component';
import { LobbyComponent } from './app/lobby/lobby.component';
import { BossComponent } from './app/voting/voting.component';
import { GameComponent } from './app/game/game.component';
import { SummaryComponent } from './app/summary/summary.component';

const ROUTES: Routes = [
    {path: '', redirectTo: 'mainmenu', pathMatch: "full"},
    {path: 'mainmenu', component: MainMenuComponent},
    {path: 'lobby', component:LobbyComponent},
    {path: 'boss', component:BossComponent},
    {path: 'game', component:GameComponent},
    {path: 'summary', component:SummaryComponent}
];
export const CONST_ROUTING = RouterModule.forRoot(ROUTES);