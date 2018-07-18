import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, filter, map, mergeMap, takeWhile, shareReplay, startWith, delay} from 'rxjs/operators';

import { Traveler } from '../_models/traveler';
@Injectable({
  providedIn: 'root'
})
export class TravelerService {

  private travelerSubject: BehaviorSubject<Traveler[]> = new BehaviorSubject([]);
  private traveler: Traveler[] = [];

  constructor(private http: HttpClient) { 
    this.travelerSubject.subscribe(_ => this.traveler = _);
  }

  private baseUrl: string = 'api/traveler';  // web api end point
  private getTravelerByIDUrl: string = 'api/flight-traveler';  // web api end point
  private updateTravelerByIDUrl: string = 'api/flight-traveler';  // web api end point
  //baseUrl: string = 'http://localhost:4200/api';

  private delayMs = 10000;

  public addTraveler(item: Traveler) {
    this.travelerSubject.next([...this.traveler, item]);
  }

  /** POST: save travelers in the server */
  public saveTravelers(items: Traveler[]): Observable<Traveler> {
    return this.http.post<Traveler>(this.baseUrl, items).pipe(
      catchError(this.handleError<Traveler>('saveTravelers'))
    );
  }

  public getTravelers(): Observable<Traveler[]> {
    return this.travelerSubject;
  }

  public getTravelerById(traveler_id: String) {
    return this.http.get<Traveler>(this.getTravelerByIDUrl + '/' + traveler_id)
    .pipe(delay(this.delayMs));
  }

  public getTravelersCount() {
    return this.traveler.length;
  }

  public removeTraveler(item: Traveler) {
    const currentItems = [...this.traveler];
    const itemsWithoutRemoved = currentItems.filter(_ => _.traveler_id !== item.traveler_id);
    this.travelerSubject.next(itemsWithoutRemoved);
  }

  public removeAllTravelers() {
    this.travelerSubject.unsubscribe;
  }

    /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      //this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
