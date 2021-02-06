import {BaseModel, Model, ModelState} from '../../app.models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ModelSerializer} from '../../app.serializers';
import {environment} from '../../../environments/environment';
import {BaseModelService} from './base-model.service';
import {HttpClient} from '@angular/common/http';


export class PaginationContainer<T extends BaseModel> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export class ModelPaginationService<T extends BaseModel> extends BaseModelService<T> {

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

  list(pageNumber: number): Observable<PaginationContainer<T>> {
    const sanitizePageNumber = pageNumber > 0 ? pageNumber : 0;
    return this.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/?page=${sanitizePageNumber}`
    ).pipe(map((data: any) => this.convertData(data)));
  }

  filteredList(filter: string, pageNumber: number, size?: number): Observable<PaginationContainer<T>> {
    const sanitizePageNumber = pageNumber > 0 ? pageNumber : 0;
    let filterString = `${filter}&page=${sanitizePageNumber}`;
    if (size){
      filterString = `${filterString}&size=${size}`;
    }
    return this.http.get(
      `${environment.apiUrl}${this.model.modelPlural}/?${filterString}`
    ).pipe(map((data: any) => this.convertData(data)));
  }

  protected convertData(data: any): PaginationContainer<T> {
    const paginationContainer = new PaginationContainer<T>();
    paginationContainer.count = data.count;
    paginationContainer.next = data.next;
    paginationContainer.previous = data.previous;
    paginationContainer.results = data.results.map(item => this.serializer.fromJson(item, ModelState.Retrieved));
    return paginationContainer;
  }

}
