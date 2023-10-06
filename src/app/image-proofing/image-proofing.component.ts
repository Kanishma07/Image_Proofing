import { Component, ViewChild, ElementRef, Renderer2, OnInit } from '@angular/core';
import { Annotation, NgxAnnotateTextComponent } from "ngx-annotate-text";

@Component({
  selector: 'app-image-proofing',
  templateUrl: './image-proofing.component.html',
  styleUrls: ['./image-proofing.component.css']
})
export class ImageProofingComponent implements OnInit{
  enteredAnnotation: any = '';

  @ViewChild('annotateText') ngxAnnotateText?: NgxAnnotateTextComponent;
  // @ViewChild(NgxAnnotatorComponent) annotator: NgxAnnotatorComponent;
  @ViewChild('canvas') canvas!: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    // Create an image element
    const image = new Image();
    image.src = 'https://thedispatch.blob.core.windows.net/thedispatchimages/2022/04/1913623-990x494.jpeg';
  
    // When the image loads, add it to the DOM
    image.onload = () => {
      const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');

      if (ctx) {
        canvasElement.width = image.width;
        canvasElement.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        // Calculate the aspect ratio
        // const aspectRatio = image.width / image.height;

        // // Calculate the new width and height based on the desired width (e.g., canvas width)
        // const desiredWidth = canvasElement.width;
        // const desiredHeight = desiredWidth / aspectRatio;

        // Draw the image, scaling it to fit within the canvas dimensions
        // const x = (canvasElement.width - desiredWidth) / 2;
        // const y = (canvasElement.height - desiredHeight) / 2;

        // ctx.drawImage(image, 0, 0, desiredWidth, desiredHeight);
        // ctx.drawImage(image, 0, 0, desiredWidth, desiredHeight);


        // Add your annotation logic here
        const annotations: { x: number; y: number; text: string }[] = [];

        // Add a click event listener to the canvas to capture user interactions
        canvasElement.addEventListener('click', (event) => {
          const x = event.offsetX;
          const y = event.offsetY;

          // Prompt the user for annotation text
          const annotationText = prompt('Enter annotation text:');

          // You can use x and y to create an annotation or marker
          // For simplicity, we'll draw a red dot as a marker
          // ctx.fillStyle = 'red';
          // ctx.beginPath();
          // ctx.arc(x, y, 5, 0, Math.PI * 2);
          // ctx.fill();

          if (annotationText) {
            // Draw the text on the canvas
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = 'white'; // Text color
            // ctx.beginPath();
            // ctx.fillText(annotationText, x, y);
            const textWithDot = '\u2022 ' + annotationText; // Add a bullet (dot) before the text
            ctx.fillText(textWithDot, x, y);

            // Store the annotation coordinates and text
            // For example, push them into an array or send them to a server for storage
            const annotation = { x, y, text: annotationText };
            annotations.push(annotation);

            console.log('Added annotation:', annotation);
            this.enteredAnnotation = annotation.text;
          }
        });
      } else {
        console.error('Canvas context is null.');
      }
    };
  }


  text = 'On August 1, we went on vacation to Barcelona, Spain. Our flight took off at 11:00 am.';

  annotations: Annotation[] = [
    new Annotation(3, 11, 'Date', '#0d6efd'),
    new Annotation(36, 45, 'City', '#dc3545'),
    new Annotation(47, 52, 'Country', '#198754'),
    new Annotation(77, 85, 'Time', '#6c757d'),
  ];

  events: string[] = [];

  addAnnotation(label: string, color: string): void {
    if (!this.ngxAnnotateText) {
      return;
    }

    const selection = this.ngxAnnotateText.getCurrentTextSelection();
    if (!selection) {
      return;
    }

    if (this.ngxAnnotateText.isOverlappingWithExistingAnnotations(selection)) {
      alert('The selected text is already annotated.');
      return;
    }

    const annotation = new Annotation(selection.startIndex, selection.endIndex, label, color);
    this.annotations = this.annotations.concat(annotation);
    this.events.push(`Added '${annotation}'`);
  }

  onClickAnnotation(annotation: Annotation) {
    this.events.push(`Clicked on '${annotation}'`);
  }

  onRemoveAnnotation(annotation: Annotation): void {
    this.events.push(`Removed '${annotation}'`);
  }

  // onImageClick(event: MouseEvent) {
  //   // Extract the click coordinates
  //   const x = event.clientX;
  //   const y = event.clientY;

  //   // Create an annotation
  //   const annotation = {
  //     x: x,
  //     y: y,
  //     text: 'Your annotation text here'
  //   };

  //   // Add the annotation to the annotator
  //   this.annotator.addAnnotation(annotation);
  // }
}
