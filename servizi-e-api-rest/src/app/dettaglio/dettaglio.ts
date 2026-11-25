import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../modelli/post';
import { PostService } from '../services/post-service';
import { messaggioErrore } from '../errori';

@Component({
  selector: 'app-dettaglio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dettaglio.html',
  styleUrl: './dettaglio.css',
})
export class Dettaglio {
  private readonly postService = inject(PostService);
  private readonly router = inject(Router);

  readonly post = signal<Post | null>(null);
  readonly id = signal(0);
  readonly caricamento = signal(false);
  readonly errore = signal<string | null>(null);
  readonly primoId = 1;
  readonly ultimoId = 100;

  readonly usaMorph = computed(() => this.postService.modalitaTransizione() === 'morph');
  readonly usaSlide = computed(() => this.postService.modalitaTransizione() === 'slide');
  readonly puoPrecedente = computed(() => this.post() !== null && this.id() > this.primoId);
  readonly puoSuccessivo = computed(() => this.post() !== null && this.id() < this.ultimoId);
  readonly postPrecedente = computed(() => this.postService.ottieniDaCache(this.id() - 1));
  readonly postSuccessivo = computed(() => this.postService.ottieniDaCache(this.id() + 1));
  readonly progressoScala = computed(() => Math.min(1, Math.max(0, this.id() / this.ultimoId)));

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((parametri) => {
        const id = Number(parametri.get('id'));
        this.id.set(id);
        this.carica(id);
      });
  }

  @HostListener('document:keydown', ['$event'])
  gestisciFrecce(event: KeyboardEvent): void {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]')
    ) {
      return;
    }
    if (event.key === 'ArrowLeft' && this.puoPrecedente()) {
      event.preventDefault();
      this.vai(this.id() - 1);
    } else if (event.key === 'ArrowRight' && this.puoSuccessivo()) {
      event.preventDefault();
      this.vai(this.id() + 1);
    }
  }

  preparaRitorno(): void {
    this.postService.impostaTransizione(this.id(), 'morph');
  }

  carica(id: number): void {
    this.errore.set(null);
    const inCache = this.postService.ottieniDaCache(id);
    this.post.set(inCache ?? null);
    this.caricamento.set(!inCache);

    this.postService.caricaUno(id).subscribe({
      next: (dati) => {
        if (this.id() !== id) return;
        this.post.set(dati);
        this.caricamento.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (this.id() !== id) return;
        this.post.set(null);
        this.errore.set(messaggioErrore(err));
        this.caricamento.set(false);
      },
    });
  }

  vai(id: number): void {
    if (id < this.primoId || id > this.ultimoId) return;
    this.postService.modalitaTransizione.set('slide');
    this.router.navigate(['/posts', id]);
  }
}
