import {BaseModel, Model, ModelState} from '../../app.models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ModelSerializer} from '../../app.serializers';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';


export abstract class BaseModelService<T extends BaseModel> {

  constructor(
    protected http: HttpClient,
    protected model: typeof Model,
    protected serializer: ModelSerializer<T>,
  ) {
  }

  updateList(toUpdateModelList: T[], updatedModel: T): T[] {
    const modelListCopy = Object.assign([], toUpdateModelList);
    const modelCopy = Object.assign({}, updatedModel);

    const toUpdateModel = modelListCopy.find(function(currentModel: T) {
      // @ts-ignore
      return currentModel.id === this;
    }, modelCopy.id);
    const toUpdateModelIndex = modelListCopy.indexOf(toUpdateModel);
    modelListCopy[toUpdateModelIndex] = modelCopy;
    return modelListCopy;
  }

  deleteFromList(toUpdateModelList: T[], deletedModel: T): T[] {
    return toUpdateModelList.filter(function(currentModel: T) {
      return currentModel.id !== this;
    }, deletedModel.id);
  }

  get(id: number | string): Observable<T[]> {
    return this.http.get(
      `${environment.apiUrl}${this.model.modelName}/${id}/`
    ).pipe(map(data => [this.serializer.fromJson(data, ModelState.Retrieved)]));
  }


  create(item: T): Observable<T> {
    return this.http.post(
      `${environment.apiUrl}${this.model.modelPlural}/`,
      this.serializer.toCreateJson(item)
    ).pipe(
      map(data => this.serializer.fromJson(data, ModelState.Created))
    );
  }

  update(item: T): Observable<T> {
    return this.http.put(
      `${environment.apiUrl}${this.model.modelPlural}/${item[this.model.lookupField]}/`,
      this.serializer.toUpdateJson(item)
    ).pipe(
      map(data => this.serializer.fromJson(data, ModelState.Modified))
    );
  }

  delete(item: T): Observable<T> {
    return this.http.delete(
      `${environment.apiUrl}${this.model.modelPlural}/${item[this.model.lookupField]}/`
    ).pipe(
      map(() => undefined)
    );
  }
}
