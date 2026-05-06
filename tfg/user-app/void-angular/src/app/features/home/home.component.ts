import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { HeroComponent } from '../hero/hero.component';
import { MarqueeComponent } from '../marquee/marquee.component';
import { BestSellersComponent } from '../best-sellers/best-sellers.component';
import { NewArrivalsComponent } from '../new-arrivals/new-arrivals.component';
import { CollectionComponent } from '../collection/collection.component';
import { StatsComponent } from '../stats/stats.component';
import { CategoriesComponent } from '../categories/categories.component';

@Component({
  selector: 'void-home',
  imports: [
    HeroComponent,
    MarqueeComponent,
    BestSellersComponent,
    NewArrivalsComponent,
    CollectionComponent,
    StatsComponent,
    CategoriesComponent,
    RevealDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
