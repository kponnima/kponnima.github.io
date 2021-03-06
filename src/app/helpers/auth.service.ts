import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { User } from '../models/user';

@Injectable()
export class AuthService {  
    // Create a stream of logged in status to communicate throughout app
    loggedIn = new BehaviorSubject<boolean>(false);
    loggedInUserSubject: BehaviorSubject<User[]> = new BehaviorSubject([]);
    loggedInUser: User[] = [];

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  constructor(private router: Router) {
    this.loggedInUserSubject.subscribe(_ => this.loggedInUser = _);
  }

  login(user: User){
    if (user.username !== '' && user.password !== '' ) {
      this.loggedIn.next(true);
      this.addLoggedInUser(user);
      localStorage.setItem('username', user.username);
      this.router.navigate(['home']);
    }else{
      this.loggedIn.next(false);
      this.loggedInUserSubject.unsubscribe;
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdminUser');
      localStorage.removeItem('flights');
      localStorage.removeItem('travelers');
      this.router.navigate(['signin']);
    }
  }

  logout() {
    this.loggedIn.next(false);
    this.loggedInUserSubject.unsubscribe;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdminUser');
    localStorage.removeItem('flights');
    localStorage.removeItem('travelers');
    this.router.navigate(['signin']);
  }

  addLoggedInUser(user: User) {
    this.loggedInUserSubject.next([...this.loggedInUser, user]);
  }

  getLoggedInUsers(): Observable<User[]> {
    return this.loggedInUserSubject;
  }

  removeLoggedInUser(user: User) {
    const currentItems = [...this.loggedInUser];
    const itemsWithoutRemoved = currentItems.filter(_ => _._id !== user._id);
    this.loggedInUserSubject.next(itemsWithoutRemoved);
  }
}