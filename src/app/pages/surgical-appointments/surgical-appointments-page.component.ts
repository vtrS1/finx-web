import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';

import {
  AppointmentQuery,
  DateSortDirection,
  SurgicalAppointment,
  SurgicalAppointmentsResponse,
} from '@core/models/surgical-appointment.model';
import { SurgicalAppointmentsService } from '@core/services/surgical-appointments.service';
import { calculateAge } from '@core/utils/date.utils';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DataTableColumn, DataTableSort } from '@shared/components/data-table/data-table.model';
import {
  PaginationChange,
  PaginationComponent,
} from '@shared/components/pagination/pagination.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import {
  SearchFilterOption,
  SearchFilterValue,
} from '@shared/components/search-filter/search-filter.model';

type ViewModel =
  | {
      status: 'loading';
      query: AppointmentQuery;
    }
  | {
      status: 'success';
      query: AppointmentQuery;
      response: SurgicalAppointmentsResponse;
    }
  | {
      status: 'error';
      query: AppointmentQuery;
      message: string;
    };

const INITIAL_QUERY: AppointmentQuery = {
  currentPage: 1,
  itemsPerPage: 6,
  searchTerm: '',
  searchField: 'all',
  createdAt: '',
  sortDirection: 'desc',
};

@Component({
  selector: 'app-surgical-appointments-page',
  imports: [AsyncPipe, DataTableComponent, PaginationComponent, SearchFilterComponent],
  templateUrl: './surgical-appointments-page.component.html',
  styleUrl: './surgical-appointments-page.component.scss',
})
export class SurgicalAppointmentsPageComponent {
  private readonly querySubject = new BehaviorSubject<AppointmentQuery>(INITIAL_QUERY);

  readonly columns: DataTableColumn<SurgicalAppointment>[] = [
    {
      key: 'doctor',
      header: 'Medico',
      cell: (appointment) => appointment.doctor.name,
    },
    {
      key: 'patient',
      header: 'Paciente',
      cell: (appointment) => appointment.patient.name,
    },
    {
      key: 'age',
      header: 'Idade',
      cell: (appointment) => `${calculateAge(appointment.patient.birthDate)} anos`,
    },
    {
      key: 'createdAt',
      header: 'Criacao',
      cell: (appointment) => this.formatCreatedAt(appointment.createdAt),
      sortable: true,
    },
  ];

  readonly searchFieldOptions: SearchFilterOption[] = [
    { value: 'all', label: 'Medico ou paciente' },
    { value: 'doctor', label: 'Medico' },
    { value: 'patient', label: 'Paciente' },
  ];

  readonly viewModel$: Observable<ViewModel> = this.querySubject.pipe(
    distinctUntilChanged(
      (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
    ),
    switchMap((query) =>
      this.appointmentsService.getAppointments(query).pipe(
        map(
          (response): ViewModel => ({
            status: 'success',
            query,
            response,
          }),
        ),
        startWith({
          status: 'loading',
          query,
        } satisfies ViewModel),
        catchError((error: unknown) =>
          of({
            status: 'error',
            query,
            message: this.getErrorMessage(error),
          } satisfies ViewModel),
        ),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(private readonly appointmentsService: SurgicalAppointmentsService) {}

  onFiltersChanged(filters: SearchFilterValue): void {
    this.patchQuery({
      createdAt: filters.createdAt,
      searchField: filters.searchField as AppointmentQuery['searchField'],
      searchTerm: filters.searchTerm,
      sortDirection: filters.sortDirection,
      currentPage: 1,
    });
  }

  onSortDirectionChanged(sortDirection: DateSortDirection): void {
    this.patchQuery({
      sortDirection,
      currentPage: 1,
    });
  }

  onDataTableSortChanged(sort: DataTableSort): void {
    if (sort.key !== 'createdAt') {
      return;
    }

    this.onSortDirectionChanged(sort.direction);
  }

  onPaginationChanged(pagination: PaginationChange): void {
    this.patchQuery({
      currentPage: pagination.currentPage,
      itemsPerPage: pagination.itemsPerPage,
    });
  }

  getTableSort(query: AppointmentQuery): DataTableSort {
    return {
      key: 'createdAt',
      direction: query.sortDirection,
    };
  }

  private patchQuery(query: Partial<AppointmentQuery>): void {
    this.querySubject.next({
      ...this.querySubject.value,
      ...query,
    });
  }

  private formatCreatedAt(createdAt: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(createdAt));
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Nao foi possivel carregar os agendamentos.';
  }
}
