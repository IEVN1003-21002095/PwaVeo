import { Routes } from '@angular/router';
import { AgregarComponent } from './agregar/agregar.component';
import { EditarComponent } from './editar/editar.component';
import { EliminarComponent } from './eliminar/eliminar.component';
import { InventarioComponent } from './inventario/inventario.component';
export const INVENTARIO_ROUTES: Routes = [
  { path: '', component: InventarioComponent },
  { path: 'agregar', component: AgregarComponent },
  { path: 'editar/:id', component: EditarComponent },
  { path: 'eliminar/:id', component: EliminarComponent }
];
