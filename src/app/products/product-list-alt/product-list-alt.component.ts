import { ChangeDetectionStrategy, Component} from '@angular/core';

import { EMPTY, Subject, Subscription, catchError, map } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent  {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable()
  selectedProductId = 1;

  products$ = this.productService.productCategory$.pipe(
    catchError((err)=>{
      this.errorMessageSubject.next(err) ;
      return EMPTY
    })
   )
  
  selectedProduct$ = this.productService.selectedProduct$


  sub!: Subscription;

  constructor(private productService: ProductService) { }



  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId)
  }
}
