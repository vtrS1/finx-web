import { Doctor } from './doctor.model';
import { PaginatedResponse } from './pagination.model';
import { Patient } from './patient.model';

export interface SurgicalAppointment {
  id: number;
  doctor: Doctor;
  patient: Patient;
  createdAt: string;
}

export type AppointmentSearchField = 'all' | 'doctor' | 'patient';
export type DateSortDirection = 'desc' | 'asc';

export interface AppointmentQuery {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  searchField: AppointmentSearchField;
  createdAt: string;
  sortDirection: DateSortDirection;
}

export type SurgicalAppointmentsResponse = PaginatedResponse<SurgicalAppointment>;
