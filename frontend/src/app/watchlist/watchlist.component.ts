import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { elementAt, forkJoin, Observable, Subscription, timer } from 'rxjs';
import { ConnectBackend } from '../connect-backend';
import { latestPrice } from '../latestPrice';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  isEmpty: boolean;
  watchlist: any;
  finished: boolean = false;
  result = {};
  allResults = [];
  currentLatestPrice: latestPrice;
  subscription: Subscription;

  constructor(
    private router: Router,
    private connectBackend: ConnectBackend
  ) { }

  detailPageLink(ticker: string) {
    this.router.navigateByUrl('/search/' + ticker);
  }

  emptyWatchlistCheck() {
    let watchlist = [];
    if (localStorage.getItem('Watchlist')) {
      watchlist = JSON.parse(localStorage.getItem('Watchlist'));
    }
    if (watchlist.length) {
      this.isEmpty = false;
    }
    else {
      this.isEmpty = true;
    }
    return watchlist;
  }

  removeFromWatchlist(target) {
    this.allResults.splice(this.allResults.indexOf(target), 1);
    let oldWatchlist = JSON.parse(localStorage.getItem('Watchlist'));
    console.log('Before removal: ', oldWatchlist)
    let newWatchlist = [];
    let i;
    for (i = 0; i < oldWatchlist.length; i++) {
      if (oldWatchlist[i].ticker != target.ticker) {
        newWatchlist.push(oldWatchlist[i])
      }
    }
    // let newWatchlist = oldWatchlist.filter((element) => {
    //   element.ticker == target.ticker;
    // });
    localStorage.setItem('Watchlist', JSON.stringify(newWatchlist));
    this.watchlist = this.emptyWatchlistCheck();
    console.log('After removal: ', this.watchlist)
    // this.initialWatchlist();
  }

  initialWatchlist() {
    this.watchlist = this.emptyWatchlistCheck();
    console.log('current watchlist: ', this.watchlist);
    let results = [];
    this.watchlist.forEach((element) => {
      this.connectBackend.getLatestPrice(element.ticker)
        .subscribe((latestPrice) => {
          this.result = {
            ticker: latestPrice.ticker,
            name: element.name,
            latestPrice: latestPrice.last_price,
            change: latestPrice.change,
            changePercent: latestPrice.change_percentage
          }
          results.push(this.result);
        })
    })
    this.allResults = results;
  }

  updateWatchlist() {
    this.subscription = timer(0, 15000000).subscribe(() => {
      // let allLatestPrice
      // this.allResults = [];
      this.watchlist = this.emptyWatchlistCheck();
      console.log('current watchlist: ', this.watchlist)
      if (this.allResults != []) {
        this.watchlist.forEach((element: any) => {
          console.log('element: ', element)
          this.connectBackend.getLatestPrice(element.ticker)
            .subscribe((latestPrice) => {
              console.log('latestPrice ticker: ', latestPrice.ticker)
              let i;
              for (i = 0; i < this.allResults.length; i++) {
                console.log('for loop ticker: ', this.allResults[i].ticker)
                if (this.allResults[i].ticker == latestPrice.ticker) {
                  this.allResults[i].latestPrice = latestPrice.last_price;
                  this.allResults[i].change = latestPrice.change;
                  this.allResults[i].changePercent = latestPrice.change_percentage;
                }
              }
              // let item = this.watchlist.filter(
              //   (data) => data.ticker === res.ticker)[0]
              // this.result = {
              //   ticker: latestPrice.ticker,
              //   name: element.name,
              //   latestPrice: latestPrice.last_price,
              //   change: latestPrice.change,
              //   changePercent: latestPrice.change_percentage
              // }
              // console.log('result: ', this.result)
              // this.allResults.push(this.result);
            })

          // this.allLatestPrice.push(this.connectBackend.getLatestPrice(element.ticker));
          // this.allResults.push(this.result);
        });
      }
      else {
        let results = [];
        this.watchlist.forEach((element) => {
          this.connectBackend.getLatestPrice(element.ticker)
            .subscribe((latestPrice) => {
              this.result = {
                ticker: latestPrice.ticker,
                name: element.name,
                latestPrice: latestPrice.last_price,
                change: latestPrice.change,
                changePercent: latestPrice.change_percentage
              }
              results.push(this.result);
            })
        })
        this.allResults = results;
      }
      console.log('all results: ', this.allResults);
      this.finished = true;
      // console.log('allLatestPrice: ', allLatestPrice)
      // forkJoin(this.allLatestPrice).subscribe((response) => {
      //   let results = [];
      //   response.forEach((res: latestPrice) => {
      // let name = this.watchlist.filter((data) => {
      //   data.ticker === res.ticker
      // })
      // let result = {
      //   ticker:
      // }
      // })
      // })
    })
  }

  ngOnInit(): void {
    this.initialWatchlist();
    this.updateWatchlist();
    // this.removeFromWatchlist('TSLA');
  }

}
