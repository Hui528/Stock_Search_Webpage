import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { timer, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
// import * as moment from 'moment';
// import { Moment } from 'moment';
// import * as moment from 'moment';
// import 'moment-timezone';
import * as moment from 'moment-timezone';
import * as Highcharts_second from 'highcharts';
import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts/highstock';
require('highcharts/indicators/indicators')(Highcharts);
require('highcharts/indicators/volume-by-price')(Highcharts);

import { ConnectBackend } from '../connect-backend';
import { description } from '../description';
import { latestPrice } from '../latestPrice';
import { peerWebs } from '../peerWebs';
import { peers } from '../peers';
import { hourlyData } from '../hourlyData';
import { news } from '../news';
import { ModalNewsComponent } from '../modal-news/modal-news.component';
import { socialSentiments } from '../socialSentiments';
import { trends } from '../trends';
import { earning } from '../earning';
import { TransactionComponent } from '../transaction/transaction.component';
// import { watch } from 'fs';

// function timeTransform(timestamp: number) {
// return moment.tz(timestamp, 'America/Los_Angeles').utcOffset();
// format('YYYY-MM-DD HH:mm:ss')
// }
function timeZone(timestamp: any) {
  var zone = 'America/Los_Angeles',
    timezoneOffset = -moment.tz(timestamp, zone).utcOffset();
  return timezoneOffset;
}

// function getTimezoneOffset(timestamp: any) {
//   var zone = 'Europe/Oslo',
//     timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

//   return timezoneOffset;
// }

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css']
})

export class SearchDetailsComponent implements OnInit {
  private _StarMarkedSuccess = new Subject<string>();
  private _TransactionSuccess = new Subject<string>();
  starMarkedMsg = '';
  transMsg = '';
  transType = 'success';
  updateSubscribe: any;
  ticker: string = '';
  validTicker = true;
  flag = true;
  // holdList = [];
  bought: boolean = false;
  isOpen = true;
  inWatchlist = false;
  currentColor = '#098d3a';
  description: description;
  latestPrice: latestPrice;
  peerWebs: peerWebs[] = [];
  // peerWebs: description[] = [];
  peers: peers;
  hourlyData: hourlyData;
  hisData: hourlyData;
  hourlyDataFinished: boolean = false;
  hisDataFinished: boolean = false;
  // peerWeb: peerWebs;
  // time: Moment;
  Highcharts: typeof Highcharts = Highcharts;
  hourlyDataChartsOptions: Options;
  hisDataChartsOptions: Options;
  trendsChartsOptions: Options;
  earningChartsOptions: Options;
  news: news[];
  socialSentiments: socialSentiments;
  trends: trends[];
  earning: earning[];
  leftMoney: number = +localStorage.getItem('leftMoney') || 25000;

  constructor(
    private route: ActivatedRoute,
    private connectBackend: ConnectBackend,
    private newsModal: NgbModal,
    private transModalService: NgbModal,
    private router: Router
  ) { }

  searchPeer(peer: string) {
    this.ticker = peer;
    this.getDescription();

    this.connectBackend.getLatestPrice(this.ticker)
      .subscribe((latestPrice) => {
        this.latestPrice = latestPrice;
        console.log('latest price: ', this.latestPrice)
      })

    this.connectBackend.getPeers(this.ticker)
      .subscribe((peers) => {
        console.log(peers)
        this.peers = peers;
        console.log(peers.peers)
        this.peerWebs = this.peersWeb();
      })

    this.connectBackend.getHourlyData(this.ticker, this.latestPrice.current_timestamp)
      .subscribe((hourlyData) => {
        this.hourlyData = hourlyData;
        console.log('hourly data: ', this.hourlyData)
        this.hourlyDataCharts();
      })

    this.connectBackend.getHisData(this.ticker)
      .subscribe((hisData) => {
        this.hisData = hisData;
        this.hisDataCharts();
      })

    this.connectBackend.getNews(this.ticker)
      .subscribe((news) => {
        this.news = news;
        console.log('news: ', this.news)
      })

    this.connectBackend.getSocial(this.ticker)
      .subscribe((social) => {
        this.socialSentiments = social;
        console.log('social sentiments: ', this.socialSentiments)
      })

    this.connectBackend.getTrends(this.ticker)
      .subscribe((trends) => {
        this.trends = trends;
        console.log('trends: ', this.trends)
        this.trendsCharts();
      })

    this.connectBackend.getEarning(this.ticker)
      .subscribe((earning) => {
        this.earning = earning;
        console.log('earning: ', this.earning)
        this.earningCharts();
      })

    // this.updateDetailPage();
    this.setInWatchlist();

    this._StarMarkedSuccess
      .subscribe((message) => (this.starMarkedMsg = message));

    this._StarMarkedSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.starMarkedMsg = ''));

    this._TransactionSuccess
      .subscribe((message) => (this.transMsg = message));

    this._TransactionSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.transMsg = ''));

    this.checkInPortfolio();
    localStorage.setItem('Ticker', this.ticker);
  }

  peersWeb() {
    let i = 0;
    var peerWebs: peerWebs[] = []
    // let comp: peerWebs = { company: '', web: '' }
    // console.log('length of peers: ', this.description.)
    for (i = 0; i < this.peers.peers.length; i += 1) {
      let name = this.peers.peers[i];
      this.connectBackend.getDescription(this.peers.peers[i])
        .subscribe((description) => {
          let comp: peerWebs = { company: name, web: description.weburl };
          // comp.web = description.weburl;
          peerWebs.push(comp);
        });
    }
    // console.log('peerWebs:', peerWebs)
    return peerWebs;
  }

  setInWatchlist() {
    let watchlist = [];
    if (localStorage.getItem('Watchlist')) {
      watchlist = JSON.parse(localStorage.getItem('Watchlist'));
    }
    let findCurrComp = watchlist.filter((data: any) =>
      data.ticker == this.ticker.toUpperCase()
    )
    if (findCurrComp.length) {
      this.inWatchlist = true;
    }
    else {
      this.inWatchlist = false;
    }
  }

  starClick() {
    this.inWatchlist = !this.inWatchlist;
    let watchlist = [];
    let newComp;
    if (localStorage.getItem('Watchlist')) {
      watchlist = JSON.parse(localStorage.getItem('Watchlist'));
    }
    if (this.inWatchlist) {
      newComp = {
        ticker: this.description.ticker.toUpperCase(),
        name: this.description.company_name
      }
      watchlist.push(newComp);
      localStorage.setItem('Watchlist', JSON.stringify(watchlist));
    }
    else {
      let newWatchlist = watchlist.filter((data: any) =>
        data.ticker != this.ticker.toUpperCase()
      );
      localStorage.setItem('Watchlist', JSON.stringify(newWatchlist));
    }
    this._StarMarkedSuccess.next('clicked Star');
  }

  hourlyDataCharts() {
    let data = [];
    let length = this.hourlyData.close_prices.length;
    let i;
    for (i = 0; i < length; i++) {
      data.push([this.hourlyData.timestamp[i] * 1000, this.hourlyData.close_prices[i]]);
    }
    console.log(data);
    this.hourlyDataChartsOptions = {
      series: [
        {
          data: data,
          color: this.currentColor,
          showInNavigator: true,
          name: this.ticker.toUpperCase(),
          type: 'line',
          tooltip: {
            valueDecimals: 2,
          },
        },
      ],
      title: { text: this.ticker.toUpperCase() + " Hourly Price Variation" },
      rangeSelector: {
        enabled: false,
      },
      navigator: {
        series: {
          type: 'area',
          color: this.currentColor,
          fillOpacity: 1,
        },
      },
      time: {
        getTimezoneOffset: timeZone,
      },
    };
    this.hourlyDataFinished = true;
  }

  hisDataCharts() {
    let SMA = [];
    let Volume = [];
    let length = this.hisData.close_prices.length;
    let i;
    for (i = 0; i < length; i++) {
      SMA.push([this.hisData.timestamp[i] * 1000, this.hisData.open_prices[i], this.hisData.high_prices[i], this.hisData.low_prices[i], this.hisData.close_prices[i]]);
      Volume.push([this.hisData.timestamp[i] * 1000, this.hisData.volume[i]]);
    }
    console.log(SMA)
    console.log(Volume)

    this.hisDataChartsOptions = {
      series: [
        {
          type: 'candlestick',
          name: this.ticker.toUpperCase(),
          id: this.ticker,
          zIndex: 2,
          data: SMA,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: Volume,
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: this.ticker,
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: this.ticker,
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
      title: { text: this.ticker.toUpperCase() + ' Historical' },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },
      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
        },
      ],
      tooltip: {
        split: true,
      },
      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 2,
      },
      time: {
        getTimezoneOffset: timeZone,
      },
    };
    this.hisDataFinished = true;
  }

  trendsCharts() {
    let periods = [];
    let strongBuy = [];
    let buy = [];
    let hold = [];
    let sell = [];
    let strongSell = [];
    let length = this.trends.length;
    let i;
    for (i = 0; i < length; i++) {
      periods.push(this.trends[i].period);
      strongBuy.push(this.trends[i].strongBuy);
      buy.push(this.trends[i].buy);
      hold.push(this.trends[i].hold);
      sell.push(this.trends[i].sell);
      strongSell.push(this.trends[i].strongSell);
    }
    // let highcharts = Highcharts_second;
    this.trendsChartsOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Recommendation Trends'
      },
      // legend: {
      //   layout: 'vertical',
      //   align: 'center',
      //   verticalAlign: 'bottom',
      //   x: 250,
      //   y: 100,
      //   floating: true,
      //   borderWidth: 1,
      // },
      xAxis: {
        categories: periods, title: {
          text: null
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      colors: ["#0B674E", "green", "#ba9723", "#e33d46", "#5e3011"],
      // tooltip: {
      //   valueSuffix: ' millions'
      // },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true
          }
        },
        series: {
          stacking: 'normal'
        }
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: 'Strong Buy',
          type: 'column',
          data: strongBuy
        },
        {
          name: 'Buy',
          type: 'column',
          data: buy
        },
        {
          name: 'Hold',
          type: 'column',
          data: hold
        },
        {
          name: 'Sell',
          type: 'column',
          data: sell
        },
        {
          name: 'Strong Sell',
          type: 'column',
          data: strongSell
        }
      ]
    }
  }

  earningCharts() {
    let actual = [];
    let estimate = [];
    let xAxisLabel = [];
    let length = this.earning.length;
    let i;
    for (i = 0; i < length; i++) {
      actual.push(this.earning[i].actual);
      estimate.push(this.earning[i].estimate);
      xAxisLabel.push(`${this.earning[i].period}<br/>Surprise: ${this.earning[i].surprise}`);
    }

    this.earningChartsOptions = {
      chart: {
        type: "spline"
      },
      title: {
        text: "Historical EPS Surprises"
      },
      // subtitle: {
      //   text: "Source: WorldClimate.com"
      // },
      xAxis: {
        categories: xAxisLabel
      },
      yAxis: {
        title: {
          text: "Quarterly EPS"
        }
      },
      // tooltip: {
      //   valueSuffix: " °C"
      // },
      series: [{
        name: 'Actual',
        type: 'line',
        data: actual
      },
      {
        name: 'Estimate',
        type: 'line',
        data: estimate
      }]
    }
  }

  openNewsModal(news: news) {
    const newsModalRef = this.newsModal.open(ModalNewsComponent);
    newsModalRef.componentInstance.news = news;
  }

  updateDetailPage() {
    this.updateSubscribe = timer(0, 15000000)
      .subscribe(() => {
        // this.flag = false;
        this.connectBackend.getLatestPrice(this.ticker)
          .subscribe((latestPrice) => {
            this.latestPrice = latestPrice;
            let currentTime = Date.now();
            let timeDifference = currentTime - this.latestPrice.current_timestamp * 1000;
            if (timeDifference < 60 * 1000) {
              this.isOpen = true;
            }
            else {
              this.isOpen = false;
            }
            if (this.latestPrice.last_price) {
              // this.validTicker = true;
              if (this.latestPrice.change > 0) {
                this.currentColor = '#098d3a';
              }
              else {
                this.currentColor = '#ff0000';
              }

              this.connectBackend.getHourlyData(this.ticker, this.latestPrice.current_timestamp)
                .subscribe((hourlyData) => {
                  this.hourlyData = hourlyData;
                  this.hourlyDataCharts();
                });
            }
            else {
              // this.validTicker = false;
              // this.hourlyData = { detail: 'Not found.' };
            }
          });
        // this.flag = true;
      });
  }

  transactionModal(ticker, name, latestPrice, leftMoney, action) {
    let modal = this.transModalService.open(TransactionComponent);
    modal.componentInstance.ticker = ticker;
    modal.componentInstance.name = name;
    modal.componentInstance.latestPrice = latestPrice;
    modal.componentInstance.leftMoney = leftMoney;
    modal.componentInstance.action = action;
    modal.result.then((result) => {
      if (action == 'Buy') {
        this._TransactionSuccess.next('bought');
        this.transType = 'success';
      }
      if (action == 'Sell') {
        this._TransactionSuccess.next('sold');
        this.transType = 'danger';

      }
      this.checkInPortfolio();
    })
    // this.holdList.push(ticker);
    // this.checkInPortfolio();
  }

  checkInPortfolio() {
    this.bought = false;
    let portfolio = [];
    if (localStorage.getItem('Portfolio')) {
      portfolio = JSON.parse(localStorage.getItem('Portfolio'));
    }
    let i;
    for (i = 0; i < portfolio.length; i++) {
      if (this.ticker == portfolio[i].ticker) {
        this.bought = true;
        break;
      }
    }
  }

  getDescription() {
    this.connectBackend.getDescription(this.ticker)
      .subscribe((description) => {
        this.description = description;
        if (this.description.ticker) {
          this.validTicker = true;
        }
        else {
          this.validTicker = false;
        }
        console.log(this.description)
      });
    // console.log('this description: ', this.description.company_name)
  }

  getPeers() {
    this.connectBackend.getPeers(this.ticker)
      .subscribe((peers) => {
        console.log(peers)
        this.peers = peers;
        console.log(peers.peers)
        this.peerWebs = this.peersWeb();
      })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.ticker = params.get('ticker');
      console.log('ticker name in details: ' + this.ticker);
    });
    // let oldTicker = JSON.stringify(localStorage.getItem('Ticker'));
    // console.log('oldTicker: ', oldTicker)
    // if (this.ticker != oldTicker) {
    this.getDescription();
    // this.getDescription();
    // this.connectBackend.getDescription(this.ticker)
    //   .subscribe((description) => {
    //     this.description = description;
    //     console.log(this.description)
    //   });

    this.connectBackend.getLatestPrice(this.ticker)
      .subscribe((latestPrice) => {
        this.latestPrice = latestPrice;
        console.log('latest price: ', this.latestPrice)
      })

    this.connectBackend.getPeers(this.ticker)
      .subscribe((peers) => {
        console.log(peers)
        this.peers = peers;
        console.log(peers.peers)
        this.peerWebs = this.peersWeb();
      })

    // this.connectBackend.getHourlyData(this.ticker, this.latestPrice.current_timestamp)
    //   .subscribe((hourlyData) => {
    //     this.hourlyData = hourlyData;
    //     console.log('hourly data: ', this.hourlyData)
    //     this.hourlyDataCharts();
    //   })

    this.connectBackend.getHisData(this.ticker)
      .subscribe((hisData) => {
        this.hisData = hisData;
        this.hisDataCharts();
      })

    this.connectBackend.getNews(this.ticker)
      .subscribe((news) => {
        this.news = news;
        console.log('news: ', this.news)
      })

    this.connectBackend.getSocial(this.ticker)
      .subscribe((social) => {
        this.socialSentiments = social;
        console.log('social sentiments: ', this.socialSentiments)
      })

    this.connectBackend.getTrends(this.ticker)
      .subscribe((trends) => {
        this.trends = trends;
        console.log('trends: ', this.trends)
        this.trendsCharts();
      })

    this.connectBackend.getEarning(this.ticker)
      .subscribe((earning) => {
        this.earning = earning;
        console.log('earning: ', this.earning)
        this.earningCharts();
      })
    // }

    this.updateDetailPage();
    this.setInWatchlist();

    this._StarMarkedSuccess
      .subscribe((message) => (this.starMarkedMsg = message));

    this._StarMarkedSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.starMarkedMsg = ''));

    this._TransactionSuccess
      .subscribe((message) => (this.transMsg = message));

    this._TransactionSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.transMsg = ''));

    this.checkInPortfolio();
    localStorage.setItem('Ticker', this.ticker);
  }

}
