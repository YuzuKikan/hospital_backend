import { Routes } from "@angular/router";
import { IndexComponent } from "./components/index/index.component";


export const egresoRoutes: Routes = [
  {
    path: 'egreso/index',
    component: IndexComponent,
    loadChildren: () => import('./egreso.module').then(m => m.EgresoModule)
  }
];