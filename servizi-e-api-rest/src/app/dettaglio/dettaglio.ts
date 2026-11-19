import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class Dettaglio implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly post = signal<Post | null>(null);
  readonly id = signal(0);
  readonly caricamento = signal(false);
  readonly errore = signal<string | null>(null);
  readonly linkCopiato = signal(false);
  readonly primoId = 1;
  readonly ultimoId = 100;

  readonly puoPrecedente = computed(() => this.post() !== null && this.id() > this.primoId);
  readonly puoSuccessivo = computed(() => this.post() !== null && this.id() < this.ultimoId);
  readonly percentuale = computed(() => {
    const corrente = this.id();
    if (corrente < this.primoId) return 0;
    if (corrente > this.ultimoId) return 100;
    return Math.round((corrente / this.ultimoId) * 100);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((parametri) => {
      const id = Number(parametri.get('id'));
      this.id.set(id);
      this.linkCopiato.set(false);
      this.carica(id);
    });
  }

  carica(id: number): void {
    this.caricamento.set(true);
    this.errore.set(null);
    this.post.set(null);

    this.postService.caricaUno(id).subscribe({
      next: (dati) => {
        this.post.set(dati);
        this.caricamento.set(false);
      },
      error: (errore: HttpErrorResponse) => {
        this.errore.set(messaggioErrore(errore));
        this.caricamento.set(false);
      },
    });
  }

  vai(id: number): void {
    if (id < this.primoId || id > this.ultimoId) {
      return;
    }
    this.router.navigate(['/posts', id]);
  }

  copiaLink(): void {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.linkCopiato.set(true);
      setTimeout(() => this.linkCopiato.set(false), 1800);
    });
  }
}
