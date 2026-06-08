import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  AppointmentQuery,
  SurgicalAppointment,
  SurgicalAppointmentsResponse,
} from '@core/models/surgical-appointment.model';

const APPOINTMENTS_API_URL = 'http://localhost:3000/surgicalAppointments';

interface SurgicalAppointmentDto {
  id: string;
  doctor: {
    name: string;
  };
  patient: {
    name: string;
    birthDate: string;
  };
  createdAt: string;
}

export class SurgicalAppointmentsApiError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SurgicalAppointmentsApiError';
    this.cause = cause;
  }
}

@Injectable({
  providedIn: 'root',
})
export class SurgicalAppointmentsService {
  constructor(private readonly httpClient: HttpClient) {}

  getAppointments(query: AppointmentQuery): Observable<SurgicalAppointmentsResponse> {
    return this.httpClient
      .get<SurgicalAppointmentDto[]>(APPOINTMENTS_API_URL, {
        params: this.createApiParams(query),
      })
      .pipe(
        map((response) => this.toAppointments(response)),
        map((appointments) => this.applyQuery(appointments, query)),
        catchError((error) => throwError(() => this.toApiError(error))),
      );
  }

  private createApiParams(query: AppointmentQuery): HttpParams {
    return new HttpParams().set(
      '_sort',
      query.sortDirection === 'desc' ? '-createdAt' : 'createdAt',
    );
  }

  private toDomain(appointment: SurgicalAppointmentDto): SurgicalAppointment {
    return {
      id: Number(appointment.id),
      doctor: {
        name: appointment.doctor.name,
      },
      patient: {
        name: appointment.patient.name,
        birthDate: appointment.patient.birthDate,
      },
      createdAt: appointment.createdAt,
    };
  }

  private toAppointments(response: SurgicalAppointmentDto[]): SurgicalAppointment[] {
    if (!Array.isArray(response)) {
      throw new SurgicalAppointmentsApiError('A API retornou uma resposta invalida.');
    }

    return response.map((appointment) => this.toDomain(appointment));
  }

  private applyQuery(
    appointments: SurgicalAppointment[],
    query: AppointmentQuery,
  ): SurgicalAppointmentsResponse {
    const filtered = appointments
      .filter((appointment) => this.matchesSearch(appointment, query))
      .filter((appointment) => this.matchesCreatedAt(appointment, query.createdAt));
    const sorted = this.sortByCreatedAt(filtered, query.sortDirection);
    const totalItems = sorted.length;
    const totalPages = Math.max(Math.ceil(totalItems / query.itemsPerPage), 1);
    const currentPage = Math.min(Math.max(query.currentPage, 1), totalPages);
    const start = (currentPage - 1) * query.itemsPerPage;
    const data = sorted.slice(start, start + query.itemsPerPage);

    return {
      data,
      pagination: {
        currentPage,
        itemsPerPage: query.itemsPerPage,
        totalPages,
        totalItems,
        nextPageUrl:
          currentPage < totalPages ? this.createPaginationUrl(currentPage + 1, query) : null,
        previousPageUrl: currentPage > 1 ? this.createPaginationUrl(currentPage - 1, query) : null,
      },
    };
  }

  private matchesSearch(appointment: SurgicalAppointment, query: AppointmentQuery): boolean {
    const searchTerm = this.normalize(query.searchTerm);

    if (!searchTerm) {
      return true;
    }

    const doctorName = this.normalize(appointment.doctor.name);
    const patientName = this.normalize(appointment.patient.name);

    if (query.searchField === 'doctor') {
      return doctorName.includes(searchTerm);
    }

    if (query.searchField === 'patient') {
      return patientName.includes(searchTerm);
    }

    return doctorName.includes(searchTerm) || patientName.includes(searchTerm);
  }

  private matchesCreatedAt(appointment: SurgicalAppointment, createdAt: string): boolean {
    return !createdAt || appointment.createdAt.startsWith(createdAt);
  }

  private sortByCreatedAt(
    appointments: SurgicalAppointment[],
    direction: AppointmentQuery['sortDirection'],
  ): SurgicalAppointment[] {
    return [...appointments].sort((first, second) => {
      const firstTime = new Date(first.createdAt).getTime();
      const secondTime = new Date(second.createdAt).getTime();

      return direction === 'desc' ? secondTime - firstTime : firstTime - secondTime;
    });
  }

  private createPaginationUrl(page: number, query: AppointmentQuery): string {
    const params = new HttpParams()
      .set('currentPage', page)
      .set('itemsPerPage', query.itemsPerPage)
      .set('searchTerm', query.searchTerm)
      .set('searchField', query.searchField)
      .set('createdAt', query.createdAt)
      .set('sortDirection', query.sortDirection);

    return `${APPOINTMENTS_API_URL}?${params.toString()}`;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private toApiError(error: unknown): SurgicalAppointmentsApiError {
    if (error instanceof SurgicalAppointmentsApiError) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new SurgicalAppointmentsApiError(
          'Nao foi possivel conectar ao JSON Server. Rode npm run api e tente novamente.',
          error,
        );
      }

      return new SurgicalAppointmentsApiError(
        `A API de agendamentos retornou erro ${error.status}.`,
        error,
      );
    }

    return new SurgicalAppointmentsApiError('Erro inesperado ao carregar agendamentos.', error);
  }
}
