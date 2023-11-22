import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalModule } from '../global/global.module';
import { IndexComponent } from './components/index/index.component';
import { FormComponent } from './components/form/form.component';



@NgModule({
  declarations: [
    IndexComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    GlobalModule
  ]
})
export class EgresoModule { }
