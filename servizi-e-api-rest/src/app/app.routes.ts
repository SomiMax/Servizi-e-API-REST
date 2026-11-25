import { Routes } from '@angular/router';
import { Elenco } from './elenco/elenco';
import { Dettaglio } from './dettaglio/dettaglio';

export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'posts', component: Elenco },
  { path: 'posts/:id', component: Dettaglio },
  { path: '**', redirectTo: 'posts' },
];
