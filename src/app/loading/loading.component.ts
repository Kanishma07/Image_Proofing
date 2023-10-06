import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  progressValue: number = 0;

  ngOnInit() {
    this.simulateSlowLoading();
  }

  simulateSlowLoading() {
    const interval = setInterval(() => {
      if (this.progressValue < 100) {
        this.progressValue += 1;
      } else {
        clearInterval(interval); // Stop the timer when progress reaches 100%
      }
    }, 100);
  }
}
