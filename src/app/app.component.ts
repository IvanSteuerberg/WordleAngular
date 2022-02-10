import { Component } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Wordle';
  isDarkMode!: boolean;
  constructor(private themeService: ThemeService){
    this.themeService.initTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  toggleDarkMode(){
    this.isDarkMode = this.themeService.isDarkMode();
    //if (this.isDarkMode){
      //this.themeService.update('light-mode');
    //}else{
      //this.themeService.update('dark-mode');
    //}
    
    this.isDarkMode ? this.themeService.update('light-mode') : this.themeService.update('dark-mode')
  }
}
