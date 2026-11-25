import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ActivatedRouteSnapshot, provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { PostService } from './services/post-service';

const idRotta = (s: ActivatedRouteSnapshot): number | null =>
  Number(s.firstChild?.paramMap.get('id')) || null;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const postService = inject(PostService);
          const fromId = idRotta(from);
          const toId = idRotta(to);

          if (fromId && toId && fromId !== toId) {
            postService.impostaTransizione(toId, 'slide');
            (transition as ViewTransition & { types?: Set<string> }).types?.add(
              toId > fromId ? 'forward' : 'backward',
            );
          } else {
            const id = toId ?? fromId;
            postService.impostaTransizione(id, id ? 'morph' : null);
          }

          transition.finished.finally(() => {
            postService.impostaTransizione(toId, null);
            document.querySelector<HTMLElement>('[data-route-heading]')?.focus({ preventScroll: true });
          });
        },
      }),
    ),
    provideHttpClient(),
  ],
};
