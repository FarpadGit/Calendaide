import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-nanobar',
  imports: [ButtonModule],
  templateUrl: './nanobar.html',
  styleUrl: './nanobar.scss',
})
export class Nanobar {
  isVisible: boolean = true;
}
