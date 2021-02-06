import {BaseModel, Model, ModelState} from '../../app.models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ModelSerializer} from '../../app.serializers';
import {environment} from '../../../environments/environment';
import {BaseModelService} from './base-model.service';
import {HttpClient} from '@angular/common/http';


export class ModelService<T extends BaseModel> extends BaseModelService<T> {

  constructor(
    http: HttpClient,
    model: typeof Model,
    serializer: ModelSerializer<T>,
  ) {
    super(
      http,
      model,
      serializer,
    );
  }

  list(): Observable<T[]> {
    return this.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/`
    ).pipe(map((data: any) => this.convertData(data)));
  }

  filteredList(filter: string): Observable<T[]> {
    return this.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/?${filter}`
    ).pipe(map((data: any) => this.convertData(data)));
  }

  private convertData(data: any): T[] {
    return data.map(item => this.serializer.fromJson(item, ModelState.Retrieved));
  }
}
