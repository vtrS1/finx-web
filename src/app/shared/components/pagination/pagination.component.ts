import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

export interface PaginationChange {
  currentPage: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) itemsPerPage = 6;
  @Input({ required: true }) totalItems = 0;
  @Input() pageSizeOptions: number[] = [3, 6, 9];
  @Output() readonly paginationChanged = new EventEmitter<PaginationChange>();

  get pageIndex(): number {
    return Math.max(this.currentPage - 1, 0);
  }

  onPageChanged(event: PageEvent): void {
    this.paginationChanged.emit({
      currentPage: event.pageIndex + 1,
      itemsPerPage: event.pageSize,
    });
  }
}
