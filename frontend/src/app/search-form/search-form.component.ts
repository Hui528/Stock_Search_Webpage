import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConnectBackend } from '../connect-backend';
import { searchAutoCom } from '../searchAutoCom';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
// import { SearchDetailsComponent } from '../search-details/search-details.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  ticker: string;
  searchfilter: searchAutoCom[] = []
  searchForm: FormGroup;
  isLoading = false;
  // searchDetailsComponent: SearchDetailsComponent;
  // test: searchAutoCom[] = []

  constructor(
    private http: HttpClient,
    private connectBackend: ConnectBackend,
    private formBuilder: FormBuilder,
    private router: Router
    // private router: Router,
    // private ngForm: NgForm
  ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({ tickerInput: '' });
    this.searchForm
      .get('tickerInput')
      .valueChanges.pipe(
        debounceTime(500),
        tap(() => (this.isLoading = true)),
        switchMap((value) =>
          this.connectBackend
            .searchAutoCom(value)
            .pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe((companies) => {
        console.log(companies);
        this.searchfilter = companies
      });
  }

  onSubmit(value: any) {
    // Before Modification
    // if (value.tickerInput.ticker) {
    //   this.ticker = value.tickerInput.ticker;
    // } else {
    //   this.ticker = value.tickerInput;
    // }
    // console.log('ticker name in form: ', this.ticker);
    // // this.router.navigateByUrl('');
    // this.router.navigateByUrl('/search/' + this.ticker);
    // // localStorage.setItem('Ticker', JSON.stringify(this.ticker));
    // console.log('ticker after navigateByUrl', this.ticker)
    // localStorage.setItem('Ticker', JSON.stringify(this.ticker));

    if (this.searchForm.value.tickerInput) {
      this.ticker = this.searchForm.value.tickerInput;
      console.log('ticker name in form: ', this.ticker);
      this.router.navigateByUrl('/search/' + this.ticker).then(()=> {
        window.location.reload();
      });
      console.log('ticker after navigateByUrl', this.ticker)
      localStorage.setItem('Ticker', JSON.stringify(this.ticker));
    }
  }

  clickOnAutocomplete(ticker) {
    this.router.navigateByUrl('/search/' + ticker).then(()=> {
      window.location.reload();
    });
    // this.searchDetailsComponent.ngOnInit();
  }

  clear() {
    this.router.navigateByUrl('/search/home');
    this.ticker = '';
    localStorage.setItem('Ticker', JSON.stringify(this.ticker));
  }

  displayFn(company: searchAutoCom) {
    if (company) {
      return company.description;
    }
  }
}
