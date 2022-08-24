import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() public ticker: string;
  @Input() public name: string;
  // @Input() public leftMoney: number;
  @Input() public latestPrice: number;
  @Input() public action: string;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  stock = {
    ticker: 'AAPL',
    name: 'Apple Inc',
    quantity: 0,
    totalCost: 0
  };
  inputQuantity: number = 0;
  // leftMoney: number = +localStorage.getItem('leftMoney') || 25000;
  leftMoney: number = 25000;
  // holdQuantity: number;

  updateLeftMoney() {
    this.leftMoney = 25000;
    let portfolios = JSON.parse(localStorage.getItem('Portfolio'));
    let i;
    for (i = 0; i < portfolios.length; i++) {
      this.leftMoney -= portfolios[i].totalCost;
    }
  }

  getCurrentItemTrans() {
    this.updateLeftMoney();
    let portfolios = [];
    if (localStorage.getItem('Portfolio')) {
      portfolios = JSON.parse(localStorage.getItem('Portfolio'));
    }
    // let i;
    // for (i = 0; i < portfolios.length; i++) {
    //   this.leftMoney -= portfolios[i].totalCost;
    // }
    let availStocks = portfolios.filter((data) => data.ticker == this.ticker);
    if (this.action == 'Buy') {
      // let availStocks = portfolios.filter((data) => data.ticker == this.ticker);
      if (availStocks.length) {
        this.stock = availStocks[0]
      }
      else {
        this.stock = {
          ticker: this.ticker,
          name: this.name,
          quantity: 0,
          totalCost: 0
        }
      }
    }
    else if (this.action == 'Sell') {
      this.stock = availStocks[0];
    }
  }

  execution() {
    console.log('current stock (before Buy/Sell): ', this.stock)
    if (this.action == 'Buy') {
      this.stock.quantity += this.inputQuantity;
      this.stock.totalCost += this.latestPrice * this.inputQuantity;
      // this.leftMoney -= this.latestPrice * this.inputQuantity;
      // console.log('left money: ', this.leftMoney)
      // localStorage.setItem('leftMoney', JSON.stringify(this.leftMoney));
    }
    else if (this.action == 'Sell') {
      this.stock.quantity -= this.inputQuantity;
      this.stock.totalCost -= this.latestPrice * this.inputQuantity;
      // this.leftMoney += this.latestPrice * this.inputQuantity;
      // console.log('left money: ', this.leftMoney)
      // localStorage.setItem('leftMoney', JSON.stringify(this.leftMoney));
    }
    console.log('current stock (After Buy/Sell): ', this.stock)

    let oldPortfolios = [];
    if (localStorage.getItem('Portfolio')) {
      oldPortfolios = JSON.parse(localStorage.getItem('Portfolio'));
    };
    console.log('old portfolios: ', oldPortfolios)

    if (this.stock.quantity == 0) {
      console.log('this.stock.quantity == 0, delete this stock')
      let newPortfolios = oldPortfolios.filter((data) => data.ticker != this.ticker);
      localStorage.setItem('Portfolio', JSON.stringify(newPortfolios));
      console.log('new portfolio: ', newPortfolios)
    }
    else {
      console.log('this.stock.quantity != 0, update this stock')
      if (oldPortfolios.filter((data) => data.ticker == this.ticker).length) {
        console.log('this stock exist in oldPortfolios, update this stock')
        let i;
        for (i = 0; i < oldPortfolios.length; i++) {
          if (oldPortfolios[i].ticker == this.ticker) {
            oldPortfolios[i] = this.stock;
            break;
          }
        }
      }
      else {
        console.log('this stock not exist in oldPortfolios, push this stock')
        oldPortfolios.push(this.stock);
      }
      localStorage.setItem('Portfolio', JSON.stringify(oldPortfolios));
      console.log('new portfolio: ', oldPortfolios)
    }
    this.updateLeftMoney();
    this.transModalService.close(this.stock);
  }
  constructor(public transModalService: NgbActiveModal) {
    this.stock = {
      ticker: 'AAPL',
      name: 'Apple Inc',
      quantity: 0,
      totalCost: 0
    }
  }

  ngOnInit(): void {
    // console.log('fdfd', localStorage.getItem('leftMoney'))
    // if (localStorage.getItem('Portfolio')) {
    //   this.leftMoney = parseInt(localStorage.getItem('leftMoney'));
    // }
    this.getCurrentItemTrans();
  }

}
