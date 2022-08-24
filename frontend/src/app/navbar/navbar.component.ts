import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  ticker: string = 'home';
  constructor(
    private router: Router
  ) { }

  originDetails() {
    this.ticker = JSON.stringify(localStorage.getItem('Ticker')).replace(/\"/g, "");
    this.router.navigateByUrl('/search/' + this.ticker);
  }

  ngOnInit(): void {
    if (localStorage.getItem('Ticker')) {
      this.ticker = JSON.stringify(localStorage.getItem('Ticker'));
    }
  }
}
