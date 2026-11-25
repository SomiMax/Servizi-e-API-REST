import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Post } from '../modelli/post';

export type ModalitaTransizione = 'morph' | 'slide' | null;

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/posts';
  private readonly dati = signal<Post[]>([]);

  readonly post = this.dati.asReadonly();
  readonly numeroPost = computed(() => this.dati().length);
  readonly postAttivoId = signal<number | null>(null);
  readonly modalitaTransizione = signal<ModalitaTransizione>(null);

  impostaTransizione(id: number | null, modalita: ModalitaTransizione): void {
    this.postAttivoId.set(id);
    this.modalitaTransizione.set(modalita);
  }

  ottieniDaCache(id: number): Post | undefined {
    return this.dati().find((p) => p.id === id);
  }

  caricaTutti(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl, { params: { _limit: 100 } }).pipe(tap((dati) => this.dati.set(dati)));
  }

  caricaUno(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }

  crea(nuovo: Omit<Post, 'id'>): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, nuovo);
  }
}
