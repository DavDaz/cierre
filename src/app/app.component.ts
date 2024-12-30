import { Component } from '@angular/core';
import { FileProcessorComponent } from './components/file-processor/file-processor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FileProcessorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cierre';
}
