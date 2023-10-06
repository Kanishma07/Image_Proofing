// import {
//   Component,
//   VERSION,
//   OnInit,
//   ViewChild,
//   ElementRef,
//   AfterViewInit,
// } from '@angular/core';
// import { Annotorious, Annotation } from '@recogito/annotorious';

// import '@recogito/annotorious/dist/annotorious.min.css';

// @Component({
//   selector: 'app-using-annotorious',
//   templateUrl: './using-annotorious.component.html',
//   styleUrls: ['./using-annotorious.component.css']
// })
// export class UsingAnnotoriousComponent implements AfterViewInit {
//   @ViewChild('annotate', { static: false }) public annotate!: ElementRef;
  
//   imageAnnotate: any;
//   annotations: any = [];

//   ngAfterViewInit() {
//     this.imageAnnotate = new Annotorious({
//       image: this.annotate.nativeElement,
//       widgets: ['COMMENT'],
//     });

//     this.imageAnnotate.on('createAnnotation', (annotation: any, overrideId: any) => {
//       console.log('1');
//       this.annotations.push(annotation);
//     });
//   }

//   save() {
//     //this.annotations = this.imageAnnotate.getAnnotations();
//   }

//   del(id: any) {
//     this.imageAnnotate.removeAnnotation(id);
//     this.annotations = this.imageAnnotate.getAnnotations();
//   }

//   clear() {
//     this.imageAnnotate.clearAnnotations();
//   }

//   annotateAgain() {
//     this.imageAnnotate.setAnnotations(this.annotations);
//     this.imageAnnotate.readOnly = true;
//   }
// }
