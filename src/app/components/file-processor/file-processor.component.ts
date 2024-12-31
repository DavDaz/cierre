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
  estadoGlobal = ''; // Estado inicial vacío para obligar la selección
  columnWidths = [22, 57, 25, 20, 25];
  fileContent: string = ''; // Contenido del archivo cargado
  csvContent: string = ''; // Contenido del CSV generado
  txtContent: string = ''; // Contenido del TXT generado
  fileProcessed = false; // Bandera para habilitar el botón de descarga
  fileSelected = false; // Bandera para habilitar la carga de archivo

  onStateChange() {
    this.fileSelected = this.estadoGlobal !== ''; // Habilitar carga de archivo si se selecciona un estado
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.endsWith('.txt')) {
        alert('Solo se permiten archivos .txt');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result as string;
        this.processFile(this.fileContent);
      };
      reader.readAsText(file);
    }
  }

  processFile(content: string) {
    const lines = content.split('\n').map((line) => line.trim());
    const cleanedLines = this.cleanLines(lines);
    const processedLines = cleanedLines.map(this.processLine);

    // Generar contenidos del CSV y TXT
    this.csvContent = this.generateCSV(processedLines, this.estadoGlobal);
    this.txtContent = this.generateFormattedText(processedLines, this.estadoGlobal);

    this.fileProcessed = true; // Habilitar el botón de descarga
  }

  cleanLines(lines: string[]): string[] {
    return lines.filter(
      (line) => line && !line.startsWith('# DE CUENTA') && !line.startsWith('B/.')
    );
  }

  processLine(line: string): string[] {
    return line.split(/\s{4,}/).map((part) => part.trim());
  }

  generateCSV(lines: string[][], estado: string): string {
    const header = '#CUENTA,NOMBRE,IDENTIFICACION,MONTO,PROGRAMA,ESTADO';
    const rows = lines.map((line) => line.join(',') + ',' + estado);
    return [header, ...rows].join('\n');
  }

  generateFormattedText(lines: string[][], estado: string): string {
    const header = this.formatRow([
      '#CUENTA',
      'NOMBRE',
      'IDENTIFICACION',
      'MONTO',
      'PROGRAMA',
      'ESTADO',
    ]);
    const formattedRows = lines.map((line) => {
      const fullLine = [...line, estado];
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

    if (columns.length > this.columnWidths.length) {
      formattedRow += columns[this.columnWidths.length]; // Estado en la posición final
    }

    return formattedRow.trimEnd();
  }

  getFormattedTimestamp(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}-${hours}-${minutes}`;
  }

  downloadFiles() {
    if (!this.fileProcessed) return;

    const timestamp = this.getFormattedTimestamp();
    const csvFilename = `archivo-${timestamp}.csv`;
    const txtFilename = `formateado-${timestamp}.txt`;

    this.downloadFile(csvFilename, this.csvContent, 'text/csv');
    this.downloadFile(txtFilename, this.txtContent, 'text/plain');

    // Limpiar estado y archivo cargado
    this.resetState();
  }

  resetState() {
    this.estadoGlobal = '';
    this.fileContent = '';
    this.csvContent = '';
    this.txtContent = '';
    this.fileProcessed = false;
    this.fileSelected = false;
  }

  verifyCSV() {
    if (!this.csvContent) {
      alert('Primero debes procesar un archivo para verificarlo.');
      return;
    }

    alert('Verificación aún no implementada. Próximamente.');
  }

  downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}
