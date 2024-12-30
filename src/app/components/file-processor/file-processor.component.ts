import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-processor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './file-processor.component.html',
  styleUrls: ['./file-processor.component.css'],
})
export class FileProcessorComponent {
  estadoGlobal = 'PAGADO'; // Estado inicial
  columnWidths = [22, 57, 25, 20, 25];

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        this.processFile(fileContent);
      };
      reader.readAsText(file);
    }
  }

  processFile(content: string) {
    const lines = content.split('\n').map((line) => line.trim());
    const cleanedLines = this.cleanLines(lines);
    const processedLines = cleanedLines.map(this.processLine);
    const csvContent = this.generateCSV(processedLines);

    // Generar nombres de archivo con fecha y hora
    const timestamp = this.getFormattedTimestamp();
    const formattedFilename = `formateado-${timestamp}.txt`;
    const csvFilename = `archivo-${timestamp}.csv`;

    const formattedText = this.generateFormattedText(processedLines);
    this.downloadFile(csvFilename, csvContent, 'text/csv');
    this.downloadFile(formattedFilename, formattedText, 'text/plain');
  }

  cleanLines(lines: string[]): string[] {
    return lines.filter(
      (line) => line && !line.startsWith('# DE CUENTA') && !line.startsWith('B/.')
    );
  }

  processLine(line: string): string[] {
    return line.split(/\s{4,}/).map((part) => part.trim());
  }

  generateCSV(lines: string[][]): string {
    const header = '#CUENTA,NOMBRE,IDENTIFICACION,MONTO,PROGRAMA,ESTADO';
    const rows = lines.map((line) => line.join(',') + ',' + this.estadoGlobal);
    return [header, ...rows].join('\n');
  }

  generateFormattedText(lines: string[][]): string {
    const header = this.formatRow([
      '#CUENTA',
      'NOMBRE',
      'IDENTIFICACION',
      'MONTO',
      'PROGRAMA',
      'ESTADO',
    ]);
    const formattedRows = lines.map((line) => {
      // Agregamos explícitamente el estado global como última columna
      const fullLine = [...line, this.estadoGlobal];
      return this.formatRow(fullLine);
    });
    return [header, ...formattedRows].join('\n');
  }

  formatRow(columns: string[]): string {
    let formattedRow = '';
    for (let i = 0; i < this.columnWidths.length; i++) {
      const column = columns[i] || '';
      formattedRow += column.padEnd(this.columnWidths[i]);
    }
  
    // Aseguramos que la columna de ESTADO se agregue correctamente
    if (columns.length > this.columnWidths.length) {
      formattedRow += columns[this.columnWidths.length]; // Estado en la posición final
    }
  
    return formattedRow.trimEnd();
  }

  getFormattedTimestamp(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}-${hours}-${minutes}`;
  }

  downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}
