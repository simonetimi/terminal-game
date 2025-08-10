import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DisplayArea } from './components/display-area/display-area';
import { InputArea } from './components/input-area/input-area';
import { PlayerStatus } from './components/player-status/player-status';
import { SplashScreen } from './components/splash-screen/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [DisplayArea, InputArea, PlayerStatus, SplashScreen],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  hideSplashScreen = signal(false);

  toggleSplashScreen($event: boolean) {
    this.hideSplashScreen.set($event);
  }
}
