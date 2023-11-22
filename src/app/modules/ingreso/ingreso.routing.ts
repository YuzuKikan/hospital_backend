import { Routes } from "@angular/router";
import { IndexComponent } from "./components/index/index.component";


export const ingresoRoutes: Routes = [
  {
    path: 'ingreso/index',
    component: IndexComponent,
    loadChildren: () => import('./ingreso.module').then(m => m.IngresoModule)
  }
];