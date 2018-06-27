import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Observable, BehaviorSubject, of } from 'rxjs';

import { Flight } from '../_models/flight';
import { CartService } from '../_services/cart.service';
export interface DialogData {
  origin: string;
  destination: string;
}
@Component({
  selector: 'app-shoppingcart',
  templateUrl: './shoppingcart.component.html',
  styleUrls: ['./shoppingcart.component.css']
})
export class ShoppingcartComponent implements OnInit {
  public shoppingCartItems$: Observable<Flight[]> = of([]);
  public shoppingCartItems: Flight[] = [];
  dataSource = this.shoppingCartItems$;
  displayedColumns = ['flight_no', 'origin', 'destination', 'departure', 'arrival', 'aircraft_id', 'button'];
  count:number = 0;

  constructor(private dialogRef: MatDialogRef<ShoppingcartComponent>, private cartService: CartService,
    private router: Router, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.shoppingCartItems$ = this.cartService.getItems();
    this.shoppingCartItems$.subscribe(_ => this.shoppingCartItems = _);
    this.count = this.cartService.getItemsCount(); 
  }

  ngOnInit(): void {
    this.dataSource = this
    .cartService
    .getItems();
  }

  removeItem(item) {
    this
      .cartService
      .removeFromCart(item);
    alert('Item removed from cart');
  }

  getTotal() {
    this
      .cartService
      .getTotalAmount;
  }
  /*datasourceCondition(){
    this.count = this
    .cartService
    .getItemsCount();
    if
  }*/

  isEmptyCart(){
    if(this.count === 0){
      //console.log('Cart is empty');
      return true;
    }
    return false;
  }

  bookFlight() {
    this.dialogRef.close();
    this.router.navigate(['flight-trip-options'], { queryParams: { fromcity: this.data.origin, tocity: this.data.destination } });
  }

  close() {
      this.dialogRef.close();
  }
}
