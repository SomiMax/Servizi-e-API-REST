import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Post } from '../modelli/post';
import { PostService } from '../services/post-service';
import { messaggioErrore } from '../errori';

@Component({
  selector: 'app-elenco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, JsonPipe],
  templateUrl: './elenco.html',
  styleUrl: './elenco.css',
})
export class Elenco implements OnInit {
  private readonly postService = inject(PostService);

  readonly post = this.postService.post;
  readonly filtro = signal('');
  readonly filtroUtente = signal<number | null>(null);
  readonly scheletri = [1, 2, 3, 4, 5, 6];

  readonly utenti = computed(() => {
    const set = new Set(this.post().map((p) => p.userId));
    return Array.from(set).sort((a, b) => a - b);
  });

  readonly filtrati = computed(() => {
    const testo = this.filtro().trim().toLowerCase();
    const utente = this.filtroUtente();

    return this.post().filter((p) => {
      if (utente !== null && p.userId !== utente) {
        return false;
      }
      if (testo === '') {
        return true;
      }
      return p.title.toLowerCase().includes(testo) || p.body.toLowerCase().includes(testo);
    });
  });

  readonly numeroFiltrati = computed(() => this.filtrati().length);
  readonly haFiltriAttivi = computed(
    () => this.filtro().trim() !== '' || this.filtroUtente() !== null,
  );

  readonly caricamento = signal(false);
  readonly errore = signal<string | null>(null);
  readonly invio = signal(false);
  readonly erroreForm = signal<string | null>(null);
  readonly creato = signal<Post | null>(null);
  readonly copiato = signal(false);

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.caricamento.set(true);
    this.errore.set(null);

    this.postService.caricaTutti().subscribe({
      next: () => this.caricamento.set(false),
      error: (errore: HttpErrorResponse) => {
        this.errore.set(messaggioErrore(errore));
        this.caricamento.set(false);
      },
    });
  }

  impostaUtente(valore: string): void {
    this.filtroUtente.set(valore === '' ? null : Number(valore));
  }

  azzeraFiltri(): void {
    this.filtro.set('');
    this.filtroUtente.set(null);
  }

  crea(campoTitolo: HTMLInputElement, campoTesto: HTMLTextAreaElement): void {
    const titolo = campoTitolo.value.trim();
    const testo = campoTesto.value.trim();

    if (titolo === '' || testo === '') {
      this.erroreForm.set('Inserisci sia il titolo sia il testo prima di inviare.');
      return;
    }

    this.erroreForm.set(null);
    this.invio.set(true);

    this.postService.crea({ userId: 1, title: titolo, body: testo }).subscribe({
      next: (risposta) => {
        this.creato.set(risposta);
        this.copiato.set(false);
        this.invio.set(false);
        campoTitolo.value = '';
        campoTesto.value = '';
      },
      error: (errore: HttpErrorResponse) => {
        this.erroreForm.set(`Invio non riuscito. ${messaggioErrore(errore)}`);
        this.invio.set(false);
      },
    });
  }

  copiaRisposta(): void {
    const risposta = this.creato();
    if (!risposta || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(risposta, null, 2)).then(() => {
      this.copiato.set(true);
      setTimeout(() => this.copiato.set(false), 1800);
    });
  }
}
