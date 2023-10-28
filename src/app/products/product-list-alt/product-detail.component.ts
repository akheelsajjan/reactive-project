import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Supplier } from '../../suppliers/supplier';


import { ProductService } from '../product.service';
import { EMPTY, Subject, catchError, combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>()
  errorMessage$ = this.errorMessageSubject.asObservable()

  productSuppliers: Supplier[] | null = null;

  product$ = this.productService.selectedProduct$.pipe(
    catchError((err)=>{
      this.errorMessageSubject.next(err)
      return EMPTY
    })
   )

   pageTitle$ = this.product$
   .pipe(
      map(p=>p?`Product details for ${p.productName}`:null)
   )


   productSupplier$ = this.productService.selectedProductSupplier$
   .pipe(
    catchError((err)=>{
      this.errorMessageSubject.next(err)
      return EMPTY
    })
   )

   vm$ = combineLatest([
    this.product$,
    this.pageTitle$,
    this.productSupplier$
   ]).pipe(
    filter(([product])=> Boolean(product)),
    map(([product, pageTitle, productSuppliers])=>
      ({product, pageTitle, productSuppliers})
    )
   )

  constructor(private productService: ProductService) { }

}
