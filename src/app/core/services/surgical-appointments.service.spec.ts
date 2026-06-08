import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AppointmentQuery } from '@core/models/surgical-appointment.model';
import {
  SurgicalAppointmentsApiError,
  SurgicalAppointmentsService,
} from './surgical-appointments.service';

const defaultQuery: AppointmentQuery = {
  currentPage: 1,
  itemsPerPage: 3,
  searchTerm: '',
  searchField: 'all',
  createdAt: '',
  sortDirection: 'desc',
};

const apiResponse = [
  {
    id: '1',
    doctor: {
      name: 'Afonso Silva',
    },
    patient: {
      name: 'Gustavo Santos',
      birthDate: '2023-08-21',
    },
    createdAt: '2024-09-20T12:00:00Z',
  },
  {
    id: '2',
    doctor: {
      name: 'Fernando Santos',
    },
    patient: {
      name: 'Jurandir Santos',
      birthDate: '1999-08-21',
    },
    createdAt: '2024-09-19T09:25:00Z',
  },
  {
    id: '3',
    doctor: {
      name: 'Renata Martins',
    },
    patient: {
      name: 'Marina Lopes',
      birthDate: '1985-04-12',
    },
    createdAt: '2024-09-18T16:40:00Z',
  },
  {
    id: '4',
    doctor: {
      name: 'Helena Rocha',
    },
    patient: {
      name: 'Carlos Eduardo',
      birthDate: '1977-11-02',
    },
    createdAt: '2024-09-17T11:15:00Z',
  },
  {
    id: '5',
    doctor: {
      name: 'Afonso Silva',
    },
    patient: {
      name: 'Bianca Ferreira',
      birthDate: '1991-02-10',
    },
    createdAt: '2024-09-16T08:05:00Z',
  },
  {
    id: '6',
    doctor: {
      name: 'Patricia Moreira',
    },
    patient: {
      name: 'Lucas Almeida',
      birthDate: '2010-06-30',
    },
    createdAt: '2024-09-15T14:20:00Z',
  },
  {
    id: '7',
    doctor: {
      name: 'Fernando Santos',
    },
    patient: {
      name: 'Ana Clara Mendes',
      birthDate: '1968-01-18',
    },
    createdAt: '2024-09-14T10:50:00Z',
  },
  {
    id: '8',
    doctor: {
      name: 'Marcelo Vieira',
    },
    patient: {
      name: 'Roberto Lima',
      birthDate: '1959-12-04',
    },
    createdAt: '2024-09-13T18:10:00Z',
  },
  {
    id: '9',
    doctor: {
      name: 'Renata Martins',
    },
    patient: {
      name: 'Sofia Carvalho',
      birthDate: '2002-07-23',
    },
    createdAt: '2024-09-12T07:30:00Z',
  },
  {
    id: '10',
    doctor: {
      name: 'Helena Rocha',
    },
    patient: {
      name: 'Paulo Henrique',
      birthDate: '1980-03-28',
    },
    createdAt: '2024-09-11T13:55:00Z',
  },
  {
    id: '11',
    doctor: {
      name: 'Patricia Moreira',
    },
    patient: {
      name: 'Camila Nogueira',
      birthDate: '1996-09-05',
    },
    createdAt: '2024-09-10T15:35:00Z',
  },
  {
    id: '12',
    doctor: {
      name: 'Marcelo Vieira',
    },
    patient: {
      name: 'Eduardo Teixeira',
      birthDate: '1972-05-19',
    },
    createdAt: '2024-09-09T09:45:00Z',
  },
];

describe('SurgicalAppointmentsService', () => {
  let service: SurgicalAppointmentsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SurgicalAppointmentsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SurgicalAppointmentsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should paginate appointments', async () => {
    const responsePromise = firstValueFrom(service.getAppointments(defaultQuery));
    const request = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/surgicalAppointments',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('_sort')).toBe('-createdAt');
    request.flush(apiResponse);

    const response = await responsePromise;

    expect(response.data).toHaveLength(3);
    expect(response.data[0]?.doctor.name).toBe('Afonso Silva');
    expect(response.pagination).toEqual({
      currentPage: 1,
      itemsPerPage: 3,
      totalPages: 4,
      totalItems: 12,
      nextPageUrl:
        'http://localhost:3000/surgicalAppointments?currentPage=2&itemsPerPage=3&searchTerm=&searchField=all&createdAt=&sortDirection=desc',
      previousPageUrl: null,
    });
  });

  it('should filter by doctor name', async () => {
    const responsePromise = firstValueFrom(
      service.getAppointments({
        ...defaultQuery,
        searchTerm: 'afonso',
        searchField: 'doctor',
      }),
    );

    const request = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/surgicalAppointments',
    );

    request.flush(apiResponse);

    const response = await responsePromise;
    expect(response.pagination.totalItems).toBe(2);
    expect(response.data.every((item) => item.doctor.name === 'Afonso Silva')).toBe(true);
  });

  it('should combine search term and created date filters', async () => {
    const responsePromise = firstValueFrom(
      service.getAppointments({
        ...defaultQuery,
        createdAt: '2024-09-20',
        searchTerm: 'santos',
      }),
    );

    const request = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/surgicalAppointments',
    );

    request.flush(apiResponse);

    const response = await responsePromise;
    expect(response.pagination.totalItems).toBe(1);
    expect(response.data[0]?.id).toBe(1);
  });

  it('should request oldest appointments first', async () => {
    const responsePromise = firstValueFrom(
      service.getAppointments({
        ...defaultQuery,
        sortDirection: 'asc',
      }),
    );

    const request = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/surgicalAppointments',
    );

    expect(request.request.params.get('_sort')).toBe('createdAt');
    request.flush(apiResponse);

    const response = await responsePromise;

    expect(response.data[0]?.id).toBe(12);
  });

  it('should map connection failures to a readable api error', async () => {
    const responsePromise = firstValueFrom(service.getAppointments(defaultQuery));
    const request = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/surgicalAppointments',
    );

    request.error(new ProgressEvent('Network error'));

    await expect(responsePromise).rejects.toEqual(
      expect.objectContaining({
        message: 'Nao foi possivel conectar ao JSON Server. Rode npm run api e tente novamente.',
        name: 'SurgicalAppointmentsApiError',
      }) as SurgicalAppointmentsApiError,
    );
  });
});
