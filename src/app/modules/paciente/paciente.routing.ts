import { Routes } from "@angular/router";
import { IndexComponent } from "./components/index/index.component";


export const pacienteRoutes: Routes = [
    {
        path: 'paciente/index',
        component: IndexComponent,
        loadChildren: () => import('./paciente.module').then(m => m.PacienteModule)
    }
];