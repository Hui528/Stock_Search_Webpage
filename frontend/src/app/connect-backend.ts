import { Host, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { searchAutoCom } from './searchAutoCom';
import { description } from './description';
import { latestPrice } from './latestPrice';
import { peers } from './peers';
import { hourlyData } from './hourlyData';
import { news } from './news';
import { socialSentiments } from './socialSentiments';
import { trends } from './trends';
import { earning } from './earning';
import { HOST } from './host';

@Injectable({
    providedIn: 'root',
})

export class ConnectBackend {
    private autocomplete = HOST + '/autocomplete';
    private description = HOST + '/description';
    private latestPrice = HOST + '/latestPrice';
    private peers = HOST + '/peers';
    private hourlyData = HOST + '/hourlyData';
    private hisData = HOST + '/hisData';
    private news = HOST + '/news';
    private social = HOST + '/social';
    private trends = HOST + '/trends';
    private earning = HOST + '/earning';

    constructor(private http: HttpClient) { }

    searchAutoCom(ticker: string): Observable<searchAutoCom[]> {
        const url = `${this.autocomplete}/${ticker}`;
        return this.http.get<searchAutoCom[]>(url)
    }

    getDescription(ticker: string): Observable<description> {
        const url = `${this.description}/${ticker}`;
        return this.http.get<description>(url)
    }

    getLatestPrice(ticker: string): Observable<latestPrice> {
        const url = `${this.latestPrice}/${ticker}`;
        return this.http.get<latestPrice>(url)
    }

    getPeers(ticker: string): Observable<peers> {
        const url = `${this.peers}/${ticker}`;
        return this.http.get<peers>(url)
    }

    getHourlyData(ticker: string, latest: number): Observable<hourlyData> {
        const url = `${this.hourlyData}/${ticker}/${latest}`;
        return this.http.get<hourlyData>(url)
    }

    getHisData(ticker: string): Observable<hourlyData> {
        const url = `${this.hisData}/${ticker}`;
        return this.http.get<hourlyData>(url)
    }

    getNews(ticker: string): Observable<news[]> {
        const url = `${this.news}/${ticker}`;
        return this.http.get<news[]>(url)
    }

    getSocial(ticker: string): Observable<socialSentiments> {
        const url = `${this.social}/${ticker}`;
        return this.http.get<socialSentiments>(url)
    }

    getTrends(ticker: string): Observable<trends[]> {
        const url = `${this.trends}/${ticker}`;
        return this.http.get<trends[]>(url)
    }

    getEarning(ticker: string): Observable<earning[]> {
        const url = `${this.earning}/${ticker}`;
        return this.http.get<earning[]>(url)
    }
}