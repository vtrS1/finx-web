import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { DataTableColumn, DataTableSort, DataTableSortDirection } from './data-table.model';

@Component({
  selector: 'app-data-table',
  imports: [MatButtonModule, MatTableModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> {
  @Input({ required: true }) data: T[] = [];
  @Input({ required: true }) columns: DataTableColumn<T>[] = [];
  @Input() emptyTitle = 'Nenhum registro encontrado.';
  @Input() emptyDescription = 'Ajuste os filtros para ampliar a consulta.';
  @Input() sort: DataTableSort | null = null;
  @Output() readonly sortChanged = new EventEmitter<DataTableSort>();

  get displayedColumns(): string[] {
    return this.columns.map((column) => column.key);
  }

  getValue(row: T, column: DataTableColumn<T>): string {
    return column.cell(row);
  }

  onSort(column: DataTableColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    this.sortChanged.emit({
      key: column.key,
      direction: this.getNextDirection(column.key),
    });
  }

  getSortIndicator(column: DataTableColumn<T>): string {
    if (!column.sortable || this.sort?.key !== column.key) {
      return '';
    }

    return this.sort.direction === 'desc' ? 'v' : '^';
  }

  private getNextDirection(columnKey: string): DataTableSortDirection {
    if (this.sort?.key !== columnKey) {
      return 'asc';
    }

    return this.sort.direction === 'desc' ? 'asc' : 'desc';
  }
}
