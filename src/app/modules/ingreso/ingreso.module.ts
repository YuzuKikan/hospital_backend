import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalModule } from '../global/global.module';
import { FormComponent } from './components/form/form.component';
import { IndexComponent } from './components/index/index.component';



@NgModule({
  declarations: [
    FormComponent,
    IndexComponent
  ],
  imports: [
    CommonModule,
    GlobalModule
  ]
})
export class IngresoModule { }
