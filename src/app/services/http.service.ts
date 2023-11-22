import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(
        private httpCliente: HttpClient
    ) { }

    LeerTodoMedico(cantidad: number, pagina: number, textoBusqueda: string) {
        let parametros = new HttpParams();

        parametros = parametros.append('cantidad', cantidad);
        parametros = parametros.append('pagina', pagina);
        parametros = parametros.append('textoBusqueda', textoBusqueda);

        return this.httpCliente.get('http://localhost:61766/api/medico', { params: parametros })
    }
    LeerTodoPaciente(cantidad: number, pagina: number, textoBusqueda: string) {
        let parametros = new HttpParams();

        parametros = parametros.append('cantidad', cantidad);
        parametros = parametros.append('pagina', pagina);
        parametros = parametros.append('textoBusqueda', textoBusqueda);

        return this.httpCliente.get('http://localhost:61766/api/paciente', { params: parametros })
    }
    LeerTodoIngreso(cantidad: number, pagina: number, textoBusqueda: string) {
        let parametros = new HttpParams();

        parametros = parametros.append('cantidad', cantidad);
        parametros = parametros.append('pagina', pagina);
        parametros = parametros.append('textoBusqueda', textoBusqueda);
        // console.log(textoBusqueda);
        // console.log("parametros ==> ", { params: parametros });
        return this.httpCliente.get('http://localhost:61766/api/ingreso', { params: parametros })
    }
    LeerTodoEgreso(cantidad: number, pagina: number, textoBusqueda: string) {
        let parametros = new HttpParams();

        parametros = parametros.append('cantidad', cantidad);
        parametros = parametros.append('pagina', pagina);
        parametros = parametros.append('textoBusqueda', textoBusqueda);

        return this.httpCliente.get('http://localhost:61766/api/egreso', { params: parametros })
    }



    EliminarMedico(ids: number[]) {
        const option = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: ids
        };
        return this.httpCliente.delete('http://localhost:61766/api/medico', option);
    }
    EliminarPaciente(ids: number[]) {
        const option = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: ids
        };
        return this.httpCliente.delete('http://localhost:61766/api/paciente', option);
    }
    EliminarIngreso(ids: number[]) {
        const option = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: ids
        };
        return this.httpCliente.delete('http://localhost:61766/api/ingreso', option);
    }
    EliminarEgreso(ids: number[]) {
        const option = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: ids
        };
        return this.httpCliente.delete('http://localhost:61766/api/egreso', option);
    }

    CrearMedico(item: any) {
        return this.httpCliente.post('http://localhost:61766/api/medico', item);
    }

    LeerUnoMedico(id: number) {
        return this.httpCliente.get(`http://localhost:61766/api/medico/${id}`);
    }

    ActualizarMedico(id: number, item: any) {
        return this.httpCliente.put(`http://localhost:61766/api/medico/${id}`, item);
    }
    // ###############################################################################
    // ###############################################################################
    // ###############################################################################
    CrearPaciente(item: any) {
        return this.httpCliente.post('http://localhost:61766/api/paciente', item);
    }

    LeerUnoPaciente(id: number) {
        return this.httpCliente.get(`http://localhost:61766/api/paciente/${id}`);
    }

    ActualizarPaciente(id: number, item: any) {
        return this.httpCliente.put(`http://localhost:61766/api/paciente/${id}`, item);
    }
    // ###############################################################################
    // ###############################################################################
    // ###############################################################################
    CrearIngreso(item: any) {
        console.log("ENTRADA " + item.fecha)
        return this.httpCliente.post('http://localhost:61766/api/ingreso', item);
    }

    LeerUnoIngreso(id: number) {
        return this.httpCliente.get(`http://localhost:61766/api/ingreso/${id}`);
    }

    ActualizarIngreso(id: number, item: any) {
        return this.httpCliente.put('http://localhost:61766/api/ingreso/' + id, item);
    }
    // ###############################################################################
    // ###############################################################################
    // ###############################################################################
    CrearEgreso(item: any) {
        return this.httpCliente.post('http://localhost:61766/api/egreso', item);
    }

    LeerUnoEgreso(id: number) {
        return this.httpCliente.get(`http://localhost:61766/api/egreso/${id}`);
    }

    ActualizarEgreso(id: number, item: any) {
        return this.httpCliente.put(`http://localhost:61766/api/egreso/${id}`, item);
    }
}