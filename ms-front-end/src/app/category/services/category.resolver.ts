import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Category} from '../../app.models';
import {Observable} from 'rxjs';
import {CategoryService} from './category.service';


@Injectable({
  providedIn: 'root'
})
export class CategoryResolver implements Resolve<Category[]> {

  constructor(private categoryService: CategoryService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Category[]> {
    return this.categoryService.loadCategoryList();
  }
}
