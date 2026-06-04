import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '@/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authService = inject(Auth);

  async ngOnInit() {
    if (this.authService.isDemoUser()) this.authService.loginToDemo();
    else await this.authService.refreshUser();
  }
}
