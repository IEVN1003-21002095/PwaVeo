import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import GestionCatalogoService, { ProductImage, AddImageRequest } from '../services/gestion_catalogo.service';

@Component({
  selector: 'app-gestion-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-imagenes.component.html',
  styles: [`
    .image-card {
      position: relative;
      border: 2px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s;
    }
    .image-card:hover {
      border-color: #007bff;
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .image-card.principal {
      border-color: #28a745;
      border-width: 3px;
    }
    .badge-principal {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #28a745;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
    }
    .image-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 5px;
    }
    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .upload-area {
      border: 2px dashed #007bff;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-area:hover {
      background: #f0f8ff;
      border-color: #0056b3;
    }
    .upload-area.dragover {
      background: #e6f3ff;
      border-color: #0056b3;
    }
  `]
})
export class GestionImagenesComponent implements OnInit {
  productId!: number;
  productName: string = '';
  images: ProductImage[] = [];
  loading = false;
  uploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  esPrincipal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogoService: GestionCatalogoService
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.productId) {
      this.router.navigate(['/admin/catalogo']);
      return;
    }
    this.loadProductInfo();
    this.loadImages();
  }

  loadProductInfo(): void {
    this.catalogoService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.productName = product.nombre;
        }
      },
      error: (err) => console.error('Error cargando producto:', err)
    });
  }

  loadImages(): void {
    this.loading = true;
    this.catalogoService.getProductImages(this.productId).subscribe({
      next: (images) => {
        this.images = images;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando imágenes:', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.convertToBase64(this.selectedFile);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.selectedFile = files[0];
      this.convertToBase64(this.selectedFile);
    }
    
    (event.target as HTMLElement).classList.remove('dragover');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('dragover');
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.previewUrl) {
      alert('Por favor selecciona una imagen');
      return;
    }

    this.uploading = true;
    const request: AddImageRequest = {
      producto_id: this.productId,
      imagen_data: this.previewUrl,
      es_principal: this.esPrincipal ? 1 : 0
    };

    this.catalogoService.addProductImage(request).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Imagen subida correctamente');
          this.selectedFile = null;
          this.previewUrl = null;
          this.esPrincipal = false;
          this.loadImages();
        } else {
          alert('Error: ' + response.message);
        }
        this.uploading = false;
      },
      error: (err) => {
        console.error('Error subiendo imagen:', err);
        alert('Error al subir la imagen');
        this.uploading = false;
      }
    });
  }

  setPrincipal(imageId: number): void {
    if (confirm('¿Marcar esta imagen como principal?')) {
      this.catalogoService.setPrincipalImage(imageId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadImages();
          } else {
            alert('Error: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al actualizar imagen');
        }
      });
    }
  }

  deleteImage(imageId: number): void {
    if (confirm('¿Estás seguro de eliminar esta imagen?')) {
      this.catalogoService.deleteProductImage(imageId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Imagen eliminada');
            this.loadImages();
          } else {
            alert('Error: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al eliminar imagen');
        }
      });
    }
  }

  changeImage(image: ProductImage): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const newImageData = reader.result as string;
          this.catalogoService.updateProductImage(image.id, { imagen_data: newImageData }).subscribe({
            next: (response) => {
              if (response.success) {
                alert('Imagen actualizada');
                this.loadImages();
              } else {
                alert('Error: ' + response.message);
              }
            },
            error: (err) => {
              console.error('Error:', err);
              alert('Error al actualizar imagen');
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  cancelUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.esPrincipal = false;
  }

  volver(): void {
    this.router.navigate(['/admin/catalogo']);
  }
}
