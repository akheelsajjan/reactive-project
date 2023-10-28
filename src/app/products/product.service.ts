import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, map, merge, Observable, scan, shareReplay, Subject, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';



  product$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),

    catchError(this.handleError)
  );

  productCategory$ = combineLatest([
    this.product$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products,categories])=>products
      .map(products=>({
        ...products,
        price:products.price? products.price * 1.5 : undefined,
        category:categories.find(c=>products.categoryId === c.id)?.name,
        searchKey: [products.productName]
      } as Product))),
  )

  private productSelectedSubject = new BehaviorSubject<number>(0)
  productSelectedAction$ = this.productSelectedSubject.asObservable() 



  selectedProduct$ = combineLatest([
    this.productCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products,selectedId ])=>
      products.find(product => product.id === selectedId)
    ),
    tap(product => console.log('selected Product', product))
  )

  private productInsertedSubject = new Subject<Product>()
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productWithAdd$ = merge(
    this.productCategory$,
    this.productInsertedAction$
  ).pipe(
    scan((acc,value)=>
      (value instanceof Array) ? [...value]: [...acc, value], [] as Product[])
  )

  selectedProductSupplier$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.supplier$
  ]).pipe(
    map(([ selectedProduct, suppliers])=>
    suppliers.filter(supplier=> selectedProduct?.supplierIds?.includes(supplier.id))
    )
  )
  
  constructor(private http: HttpClient, private productCategoryService:ProductCategoryService, private supplierService:SupplierService) { }

  selectedProductChanged(selectedProduct:number){
    this.productSelectedSubject.next(selectedProduct);
  }    

  addProduct(){
    this.productInsertedSubject.next(this.fakeProduct())
  }

  private fakeProduct(): Product {
    return {
      id:  Math.floor(Math.random() * 3) + 1,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category:  Math.floor(Math.random() * 3) + 1,
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
