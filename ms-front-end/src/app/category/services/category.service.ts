import {ModelService} from '../../core/services/model.service';
import {Category} from '../../app.models';
import {CategorySerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends ModelService<Category> {

  public categoryList: Category[];

  constructor(http: HttpClient) {
    super(
      http,
      Category,
      new CategorySerializer()
    );
  }

  loadCategoryList(): Observable<Category[]> {
    if (this.categoryList) {
      return of(this.categoryList);
    } else {
      return this.list().pipe(
        map(categoryList => {
          this.categoryList = categoryList;
          return categoryList;
        })
      );
    }
  }

}
