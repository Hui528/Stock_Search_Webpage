import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { news } from '../news';

@Component({
  selector: 'app-modal-news',
  templateUrl: './modal-news.component.html',
  styleUrls: ['./modal-news.component.css']
})
export class ModalNewsComponent implements OnInit {
  @Input() public news: news;
  getFb: any;

  constructor(public newsModalService: NgbActiveModal) { }

  ngOnInit(): void {
    this.getFb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.news.url) + '&amp;src=sdkpreparse';
  }
}
