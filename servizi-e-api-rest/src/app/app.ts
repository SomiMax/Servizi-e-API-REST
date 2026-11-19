import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PostService } from './services/post-service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  readonly postService = inject(PostService);

  vaiANuovoPost(): void {
    this.router.navigate(['/posts']).then(() => {
      setTimeout(() => {
        const campo = document.getElementById('campo-titolo');
        if (campo) {
          campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
          campo.focus();
        }
      }, 60);
    });
  }
}
