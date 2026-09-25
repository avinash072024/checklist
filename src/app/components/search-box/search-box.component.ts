import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  imports: [FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  @Input() searchQuery: string = '';
  @Output() searchQueryChange = new EventEmitter<string>();
  
  @Output() search = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onSearch() {
    this.search.emit();
  }

  onClear() {
    this.searchQuery = '';
    this.searchQueryChange.emit(this.searchQuery);
    this.clear.emit();
  }

  onModelChange(value: string) {
    this.searchQuery = value;
    this.searchQueryChange.emit(this.searchQuery);
  }
}
