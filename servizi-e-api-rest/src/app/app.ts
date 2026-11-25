import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  constructor() {
    if (typeof document !== 'undefined' && !('startViewTransition' in document)) {
      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          takeUntilDestroyed(),
        )
        .subscribe(() =>
          queueMicrotask(() =>
            document.querySelector<HTMLElement>('[data-route-heading]')?.focus({ preventScroll: true }),
          ),
        );
    }
  }

  vaiANuovoPost(): void {
    this.router.navigate(['/posts']).then(() => {
      setTimeout(() => {
        const campo = document.getElementById('campo-titolo');
        campo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        campo?.focus();
      }, 80);
    });
  }
}
