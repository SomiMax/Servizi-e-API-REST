import { Routes } from '@angular/router';
import { Elenco } from './elenco/elenco';
import { Dettaglio } from './dettaglio/dettaglio';

/**
 * LE ROTTE DELL'APP (dispensa 03.11 / laboratorio 03.12).
 *
 * Ogni rotta associa un URL a un componente. L'ordine conta: il router usa la
 * prima rotta che corrisponde.
 *
 *  - ''            → redirect a 'posts': aprendo http://localhost:4200/ si
 *                    finisce subito sull'elenco.
 *  - 'posts'       → pagina elenco (GET /posts).
 *  - 'posts/:id'   → pagina dettaglio. `:id` è un PARAMETRO di rotta: in
 *                    /posts/7, il dettaglio riceve id = "7" (stringa!).
 *                    Lo leggiamo con ActivatedRoute.paramMap.
 *  - '**'          → wildcard: qualunque URL sconosciuto torna all'elenco
 *                    (evita la pagina bianca).
 *
 * Le rotte sono "eager" (componenti importati subito) per restare semplici;
 * in un'app grande si userebbe `loadComponent` per caricarle solo quando serve.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'posts', component: Elenco },
  { path: 'posts/:id', component: Dettaglio },
  { path: '**', redirectTo: 'posts' },
];
