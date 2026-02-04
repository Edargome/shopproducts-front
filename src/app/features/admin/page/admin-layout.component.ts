import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container py-4">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AdminLayoutComponent {}
