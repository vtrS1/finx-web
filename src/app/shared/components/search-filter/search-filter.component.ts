import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { formatDateToIsoDate, parseIsoDate } from '@core/utils/date.utils';
import {
  SearchFilterField,
  SearchFilterOption,
  SearchFilterValue,
  SearchSortDirection,
} from './search-filter.model';

interface SearchFilterForm {
  searchTerm: FormControl<string>;
  searchField: FormControl<SearchFilterField>;
  createdAt: FormControl<Date | null>;
  sortDirection: FormControl<SearchSortDirection>;
}

@Component({
  selector: 'app-search-filter',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
})
export class SearchFilterComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) value!: SearchFilterValue;
  @Input() searchPlaceholder = 'Buscar';
  @Input() fieldOptions: SearchFilterOption[] = [{ value: 'all', label: 'Todos' }];
  @Output() readonly valueChanged = new EventEmitter<SearchFilterValue>();

  readonly form = new FormGroup<SearchFilterForm>({
    searchTerm: new FormControl('', { nonNullable: true }),
    searchField: new FormControl('all', { nonNullable: true }),
    createdAt: new FormControl<Date | null>(null),
    sortDirection: new FormControl('desc', { nonNullable: true }),
  });

  constructor() {
    this.form.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(
          (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.emitValue());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']?.currentValue) {
      this.form.patchValue(
        {
          searchTerm: this.value.searchTerm,
          searchField: this.value.searchField,
          createdAt: this.value.createdAt ? parseIsoDate(this.value.createdAt) : null,
          sortDirection: this.value.sortDirection,
        },
        { emitEvent: false },
      );
    }
  }

  reset(): void {
    this.form.setValue({
      searchTerm: '',
      searchField: 'all',
      createdAt: null,
      sortDirection: 'desc',
    });
  }

  get hasActiveFilters(): boolean {
    const value = this.form.getRawValue();

    return Boolean(
      value.searchTerm ||
      value.createdAt ||
      value.searchField !== 'all' ||
      value.sortDirection !== 'desc',
    );
  }

  private emitValue(): void {
    const value = this.form.getRawValue();

    this.valueChanged.emit({
      searchTerm: value.searchTerm,
      searchField: value.searchField,
      createdAt: formatDateToIsoDate(value.createdAt),
      sortDirection: value.sortDirection,
    });
  }
}
