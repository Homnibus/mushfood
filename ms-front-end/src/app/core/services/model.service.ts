import {BaseModel, Model, ModelState} from '../../app.models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ModelSerializer} from '../../app.serializers';
import {AuthService} from './auth.service';
import {environment} from '../../../environments/environment';


export class ModelService<T extends BaseModel> {

  constructor(
    public userService: AuthService,
    public model: typeof Model,
    public serializer: ModelSerializer<T>,
  ) {
  }

  list(): Observable<T[]> {
    return this.userService.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/`
    ).pipe(map((data: Array<object>) => this.convertData(data)));
  }

  filteredList(filter: string): Observable<T[]> {
    return this.userService.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/?${filter}`
    ).pipe(map((data: Array<object>) => this.convertData(data)));
  }

  get(id: number | string): Observable<T[]> {
    return this.userService.http.get(
      `${environment.apiUrl}${this.model.modelName}/${id}/`
    ).pipe(map(data => [this.serializer.fromJson(data, ModelState.Retrieved)]));
  }


  create(item: T): Observable<T> {
    return this.userService.http.post(
      `${environment.apiUrl}${this.model.modelPlural}/`,
      this.serializer.toCreateJson(item)
    ).pipe(
      map(data => this.serializer.fromJson(data, ModelState.Created))
    );
  }

  update(item: T): Observable<T> {
    return this.userService.http.put(
      `${environment.apiUrl}${this.model.modelPlural}/${item[this.model.lookupField]}/`,
      this.serializer.toUpdateJson(item)
    ).pipe(
      map(data => this.serializer.fromJson(data, ModelState.Modified))
    );
  }

  delete(item: T): Observable<T> {
    return this.userService.http.delete(
      `${environment.apiUrl}${this.model.modelPlural}/${item[this.model.lookupField]}/`
    ).pipe(
      map(() => undefined)
    );
  }

  private convertData(data: any): T[] {
    return data.map(item => this.serializer.fromJson(item, ModelState.Retrieved));
  }
}
