import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchDetailsComponent } from './search-details/search-details.component';
import { SearchFormComponent } from './search-form/search-form.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

const routes: Routes = [
  { path: 'search/home', component: SearchFormComponent },
  // { path: '', component: SearchFormComponent },
  { path: '', redirectTo: 'search/home', pathMatch: 'full' },
  { path: 'search/:ticker', component: SearchDetailsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'portfolio', component: PortfolioComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
