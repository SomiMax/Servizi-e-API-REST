import { HttpErrorResponse } from '@angular/common/http';

export function messaggioErrore(errore: HttpErrorResponse): string {
  if (errore.status === 0) {
    return 'Nessuna connessione: il server non è raggiungibile. Controlla la rete e riprova.';
  }

  if (errore.status === 404) {
    return 'Elemento inesistente: il server ha risposto 404 (Not Found).';
  }

  return `Errore ${errore.status}: ${errore.message}`;
}
