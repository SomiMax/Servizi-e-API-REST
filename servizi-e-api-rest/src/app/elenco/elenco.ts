import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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
  private readonly campoFiltroRef = viewChild<ElementRef<HTMLInputElement>>('campoFiltro');

  readonly post = this.postService.post;
  readonly filtro = signal('');
  readonly filtroUtente = signal<number | null>(null);
  readonly scheletri = [1, 2, 3, 4, 5, 6];

  readonly utenti = computed(() =>
    [...new Set(this.post().map((p) => p.userId))].sort((a, b) => a - b),
  );

  readonly filtrati = computed(() => {
    const testo = this.filtro().trim().toLowerCase();
    const utente = this.filtroUtente();
    return this.post().filter(
      (p) =>
        (utente === null || p.userId === utente) &&
        (!testo || p.title.toLowerCase().includes(testo) || p.body.toLowerCase().includes(testo)),
    );
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
    if (this.post().length === 0) {
      this.carica();
    }
  }

  @HostListener('document:keydown', ['$event'])
  gestisciScorciatoia(event: KeyboardEvent): void {
    if (
      event.key !== '/' ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]')
    ) {
      return;
    }
    const input = this.campoFiltroRef()?.nativeElement;
    if (input) {
      event.preventDefault();
      input.focus();
      input.select();
    }
  }

  preparaTransizione(id: number): void {
    this.postService.impostaTransizione(id, 'morph');
  }

  haTransizioneMorph(id: number): boolean {
    return this.postService.postAttivoId() === id && this.postService.modalitaTransizione() === 'morph';
  }

  carica(): void {
    this.caricamento.set(true);
    this.errore.set(null);
    this.postService.caricaTutti().subscribe({
      next: () => this.caricamento.set(false),
      error: (err: HttpErrorResponse) => {
        this.errore.set(messaggioErrore(err));
        this.caricamento.set(false);
      },
    });
  }

  selezionaUtente(utente: number | null): void {
    this.filtroUtente.set(this.filtroUtente() === utente ? null : utente);
  }

  azzeraRicerca(): void {
    this.filtro.set('');
    this.campoFiltroRef()?.nativeElement.focus();
  }

  azzeraFiltri(): void {
    this.filtro.set('');
    this.filtroUtente.set(null);
  }

  crea(campoTitolo: HTMLInputElement, campoTesto: HTMLTextAreaElement): void {
    const title = campoTitolo.value.trim();
    const body = campoTesto.value.trim();
    if (!title || !body) {
      this.erroreForm.set('Inserisci sia il titolo sia il testo prima di inviare.');
      return;
    }

    this.erroreForm.set(null);
    this.invio.set(true);
    this.postService.crea({ userId: 1, title, body }).subscribe({
      next: (risposta) => {
        this.creato.set(risposta);
        this.copiato.set(false);
        this.invio.set(false);
        campoTitolo.value = '';
        campoTesto.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.erroreForm.set(`Invio non riuscito. ${messaggioErrore(err)}`);
        this.invio.set(false);
      },
    });
  }

  copiaRisposta(): void {
    const risposta = this.creato();
    if (!risposta || !navigator.clipboard) return;
    navigator.clipboard.writeText(JSON.stringify(risposta, null, 2)).then(() => {
      this.copiato.set(true);
      setTimeout(() => this.copiato.set(false), 1800);
    });
  }
}
