import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/surgical-appointments/surgical-appointments-page.component').then(
        (component) => component.SurgicalAppointmentsPageComponent,
      ),
    title: 'Solicitacoes cirurgicas | Fin-X',
  },
];
