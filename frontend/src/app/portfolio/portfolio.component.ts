import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, timer } from 'rxjs';
import { ConnectBackend } from '../connect-backend';
import { latestPrice } from '../latestPrice';
import { TransactionComponent } from '../transaction/transaction.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  private _TransactionSuccess = new Subject<string>();
  leftMoney: number = 25000;
  isEmpty: boolean = false;
  finished: boolean = false;
  updateLeftMoneyFinished: boolean = false;
  allResults = [];
  portfolios = [];
  result = {};
  subscription: Subscription;
  constructor(
    private connectBackend: ConnectBackend,
    private transModalService: NgbModal
  ) { }

  // detailPageLink(ticker: string) {
  //   this.router.navigateByUrl('/search/' + ticker);
  // }

  // update this.isEmpty and return JSON.parse(localStorage.getItem('Portfolio'))
  emptyPortfolioCheck() {
    let portfolios = [];
    if (localStorage.getItem('Portfolio')) {
      portfolios = JSON.parse(localStorage.getItem('Portfolio'));
    }
    if (portfolios.length) {
      this.isEmpty = false;
    }
    else {
      this.isEmpty = true;
    }
    return portfolios;
  }

  // remove target from localStorage and update this.portfolios
  removeFromPortfolios(target) {
    this.allResults.splice(this.allResults.indexOf(target), 1);
    let oldPortfolios = JSON.parse(localStorage.getItem('Portfolio'));
    // console.log('Before removal: ', oldPortfolios)
    let newPortfolios = [];
    let i;
    for (i = 0; i < oldPortfolios.length; i++) {
      if (oldPortfolios[i].ticker != target.ticker) {
        newPortfolios.push(oldPortfolios[i])
      }
    }
    let tempResults = [];
    for (i = 0; i < this.allResults.length; i++) {
      if (this.allResults[i].ticker != target.ticker) {
        tempResults.push(this.allResults[i])
      }
    }
    this.allResults = tempResults;
    localStorage.setItem('Portfolio', JSON.stringify(newPortfolios));
    this.portfolios = this.emptyPortfolioCheck();
    // console.log('After removal: ', this.portfolios)
  }

  updateLeftMoney() {
    this.leftMoney = 25000;
    this.portfolios = JSON.parse(localStorage.getItem('Portfolio'));
    let i;
    for (i = 0; i < this.portfolios.length; i++) {
      this.leftMoney -= this.portfolios[i].totalCost;
    }
    this.updateLeftMoneyFinished = true;
  }


  initialPortfolios() {
    this.portfolios = this.emptyPortfolioCheck();
    console.log('current portfolios: ', this.portfolios);
    let results = [];
    this.portfolios.forEach((element) => {
      this.connectBackend.getLatestPrice(element.ticker)
        .subscribe((latestPrice) => {
          let currentPrice = latestPrice.last_price;
          let avg = element.totalCost / element.quantity;
          let change = currentPrice - avg;
          console.log(change);
          this.result = {
            ticker: latestPrice.ticker,
            name: element.name,
            quantity: element.quantity,
            totalCost: element.totalCost,
            avg: avg,
            currentPrice: currentPrice,
            change: change,
            marketValue: currentPrice * element.quantity
          }
          results.push(this.result);
        })
    })
    this.allResults = results;
  }


  updatePortfolios() {
    this.subscription = timer(0, 15000000).subscribe(() => {
      this.portfolios = this.emptyPortfolioCheck();
      console.log('current portfolios: ', this.portfolios)
      if (this.allResults != []) {
        this.portfolios.forEach((element: any) => {
          // console.log('element: ', element)
          this.connectBackend.getLatestPrice(element.ticker)
            .subscribe((latestPrice) => {
              // console.log('latestPrice ticker: ', latestPrice.ticker)
              let i;
              for (i = 0; i < this.allResults.length; i++) {
                // console.log('for loop ticker: ', this.allResults[i].ticker)
                if (this.allResults[i].ticker == latestPrice.ticker) {
                  this.allResults[i].currentPrice = latestPrice.last_price;
                  this.allResults[i].change = this.allResults[i].currentPrice - this.allResults[i].avg;
                  this.allResults[i].marketValue = latestPrice.last_price * element.quantity;
                }
              }
            })
        });
      }
      else {
        let results = [];
        this.portfolios.forEach((element) => {
          this.connectBackend.getLatestPrice(element.ticker)
            .subscribe((latestPrice) => {
              let currentPrice = latestPrice.last_price;
              let avg = element.totalCost / element.quantity;
              let change = currentPrice - avg;
              console.log(change);
              this.result = {
                ticker: latestPrice.ticker,
                name: element.name,
                quantity: element.quantity,
                totalCost: element.totalCost,
                avg: avg,
                currentPrice: currentPrice,
                change: change,
                marketValue: currentPrice * element.quantity
              }
              results.push(this.result);
            })
        })
        this.allResults = results;
      }
      console.log('all results: ', this.allResults);
      this.finished = true;
    })
  }

  transactionModal(ticker, name, latestPrice, leftMoney, action) {
    let modal = this.transModalService.open(TransactionComponent);
    modal.componentInstance.ticker = ticker;
    modal.componentInstance.name = name;
    modal.componentInstance.latestPrice = latestPrice;
    modal.componentInstance.leftMoney = leftMoney;
    modal.componentInstance.action = action;
    modal.result.then((result) => {
      if (result) {
        if (result.quantity == 0) {
          this.removeFromPortfolios(result);
        }
        else {
          this.portfolios = this.emptyPortfolioCheck();
          let i;
          for (i = 0; i < this.portfolios.length; i++) {
            if (this.portfolios[i].ticker == result.ticker) {
              this.portfolios[i].quantity = result.quantity;
              this.portfolios[i].totalCost = result.totalCost;
            }
          }
          for (i = 0; i < this.allResults.length; i++) {
            if (this.allResults[i].ticker == result.ticker) {
              this.allResults[i].quantity = result.quantity;
              this.allResults[i].totalCost = result.totalCost;
              this.allResults[i].avg = result.totalCost / result.quantity;
              this.allResults[i].marketValue = result.quantity * this.allResults[i].currentPrice;
              break;
            }
          }
        }
      }
      this.updateLeftMoney();
      this._TransactionSuccess.next('Transaction finished.');
      // this.updateLeftMoney();
    })
  }


  ngOnInit(): void {
    this.updateLeftMoney();
    this.initialPortfolios();
    this.updatePortfolios();
  }

}
