import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { NavAdminComponent } from '../../nav/navAdmin/navAdmin.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink], 
  templateUrl: './home.component.html',
})
export class HomeComponent {

}