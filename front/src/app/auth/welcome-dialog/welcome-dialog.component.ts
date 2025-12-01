import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h2>¡Bienvenido!</h2>
            <button type="button" class="btn-close" (click)="close()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="welcome-message">
              <p class="greeting">Hola, <strong>{{ userName }}</strong></p>
              <p class="subtitle">Te damos la bienvenida a Veo</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="close()">Continuar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-dialog {
      width: 90%;
      max-width: 500px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      color: #1976d2;
      margin: 0;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      line-height: 1;
    }

    .btn-close:hover {
      color: #000;
    }

    .modal-body {
      padding: 30px 20px;
    }

    .welcome-message {
      text-align: center;
    }

    .greeting {
      font-size: 1.3rem;
      margin-bottom: 10px;
      color: #333;
    }

    .subtitle {
      color: #666;
      font-size: 1rem;
    }

    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #dee2e6;
      text-align: right;
    }

    .btn {
      padding: 10px 30px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1565c0;
    }
  `]
})
export class WelcomeDialogComponent {
  @Input() isOpen = false;
  @Input() userName = '';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
