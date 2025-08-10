import { Component } from '@angular/core';
import { DisplayArea } from './components/display-area/display-area';
import { InputArea } from './components/input-area/input-area';
import { PlayerStatus } from './components/player-status/player-status';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [DisplayArea, InputArea, PlayerStatus],
})
export class App {}
