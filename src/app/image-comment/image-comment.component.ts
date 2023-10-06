import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

interface Comment {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  timestamp: Date;
  editable: boolean;
}

@Component({
  selector: 'app-image-comment',
  templateUrl: './image-comment.component.html',
  styleUrls: ['./image-comment.component.css']
})
export class ImageCommentComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef;

  comments: Comment[] = [];
  canvasContext: CanvasRenderingContext2D | null = null;
  isSelecting = false;
  selectionStartX = 0;
  selectionStartY = 0;
  selectionWidth = 0;
  selectionHeight = 0;
  squareModeEnabled = false;
  arrowModeEnabled = false;

  // Zoom properties
  currentScale = 1;
  minScale = 0.5;
  maxScale = 2.0;

  // Rotation properties
  imageRotation = 0;
  isRotating = false;

  // Drag properties
  isDragging = false;
  imageX = 0;
  imageY = 0;

  // Crop properties
  cropModeEnabled = false; 
  cropStartX = 0;
  cropStartY = 0;
  cropWidth = 0;
  cropHeight = 0;

  // New property for drag mode
  isDragModeEnabled = false;
  dragStartX = 0;
  dragStartY = 0;

  constructor() { }

  ngOnInit() {
    const image = new Image();
    image.src = 'assets/top-view-desk.avif';

    image.onload = () => {
      const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
      this.canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D;

      if (this.canvasContext) {
        canvasElement.width = image.width;
        canvasElement.height = image.height;
        this.canvasContext.drawImage(image, 0, 0, image.width, image.height);
      } else {
        console.error('Canvas context is null.');
      }
    };
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.squareModeEnabled && this.canvasContext) {
      this.isSelecting = true;
      this.selectionStartX = event.offsetX;
      this.selectionStartY = event.offsetY;
      this.selectionWidth = 0;
      this.selectionHeight = 0;
    }
    if (this.arrowModeEnabled && this.canvasContext) {
      this.isSelecting = true;
      this.selectionStartX = event.offsetX;
      this.selectionStartY = event.offsetY;
    }
    if (this.cropModeEnabled && this.canvasContext) {
      this.isSelecting = true;
      this.cropStartX = event.offsetX;
      this.cropStartY = event.offsetY;
    }
    if (this.isDragModeEnabled && this.canvasContext) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      if (
        mouseX >= this.imageX * this.currentScale &&
        mouseX <= (this.imageX + this.canvas.nativeElement.width) * this.currentScale &&
        mouseY >= this.imageY * this.currentScale &&
        mouseY <= (this.imageY + this.canvas.nativeElement.height) * this.currentScale
      ) {
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isSelecting && this.canvasContext && this.squareModeEnabled) {
      this.selectionWidth = event.offsetX - this.selectionStartX;
      this.selectionHeight = event.offsetY - this.selectionStartY;
      this.drawSelection();
    }
    if (this.isSelecting && this.canvasContext && this.arrowModeEnabled) {
      // Draw arrow during mouse move, but do not update selection
      this.redrawCanvas();
      const startX = this.selectionStartX;
      const startY = this.selectionStartY;
      const endX = event.offsetX;
      const endY = event.offsetY;

      this.drawArrow(startX, startY, endX, endY);
    }
    if (this.isSelecting && this.canvasContext && this.cropModeEnabled) {
      this.cropWidth = event.offsetX - this.cropStartX;
      this.cropHeight = event.offsetY - this.cropStartY;
      this.drawCropSelection(); // Update the visual selection as you move the mouse
    }
    if (this.isDragging && this.isDragModeEnabled) {
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;

      this.imageX += deltaX;
      this.imageY += deltaY;

      this.redrawCanvas();

      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.squareModeEnabled && this.canvasContext) {
      this.isSelecting = false;
      const x = this.selectionStartX;
      const y = this.selectionStartY;
      const width = this.selectionWidth;
      const height = this.selectionHeight;

      if (width > 0 && height > 0) {
        const commentText = prompt('Enter your comment:');
        if (commentText) {
          const newComment: Comment = {
            id: Date.now(),
            x,
            y,
            width,
            height,
            text: commentText,
            timestamp: new Date(),
            editable: false
          };
          this.comments.push(newComment);
          this.redrawCanvas();
        }
      }
    }
    if (this.arrowModeEnabled && this.canvasContext) {
      this.isSelecting = false;
      const startX = this.selectionStartX;
      const startY = this.selectionStartY;
      const endX = event.offsetX;
      const endY = event.offsetY;

      if (startX !== endX || startY !== endY) {
        // Check if it's a new arrow comment
        if (this.comments.some((comment) => comment.x === startX && comment.y === startY)) {
          // Existing arrow comment, do nothing on mouse up
        } else {
          // New arrow comment
          const commentText = prompt('Enter your comment:');
          if (commentText) {
            const newComment: Comment = {
              id: Date.now(),
              x: startX,
              y: startY,
              width: endX - startX,
              height: endY - startY,
              text: commentText,
              timestamp: new Date(),
              editable: false
            };
            this.comments.push(newComment);
          }
        }
      }
      // Redraw the canvas with the updated comments
      this.redrawCanvas();
    }
    if (this.isSelecting && this.canvasContext && this.cropModeEnabled) {
      this.isSelecting = false;
      this.cropImage(); // Crop the image when you release the mouse button
    }
    if (this.isDragging && this.isDragModeEnabled) {
      this.isDragging = false;
    }
  }

  drawSelection() {
    if (this.canvasContext) {
      this.redrawCanvas();
      this.canvasContext.strokeStyle = 'red';
      this.canvasContext.strokeRect(this.selectionStartX, this.selectionStartY, this.selectionWidth, this.selectionHeight);
    }
  }

  drawArrow(startX: number, startY: number, endX: number, endY: number) {
    if (this.canvasContext) {
      this.canvasContext.strokeStyle = 'red';
      this.canvasContext.lineWidth = 2;

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(startX, startY);
      this.canvasContext.lineTo(endX, endY);

      const angle = Math.atan2(endY - startY, endX - startX);

      const arrowSize = 10;
      const arrowHead1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
      const arrowHead1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
      const arrowHead2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
      const arrowHead2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);

      this.canvasContext.lineTo(arrowHead1X, arrowHead1Y);
      this.canvasContext.moveTo(endX, endY);
      this.canvasContext.lineTo(arrowHead2X, arrowHead2Y);

      this.canvasContext.stroke();
    }
  }

  drawCropSelection() {
    if (this.canvasContext) {
      this.redrawCanvas();
      this.canvasContext.strokeStyle = 'white';
      // Set the line style to dashed
      this.canvasContext.setLineDash([5, 5]);
      
      this.canvasContext.strokeRect(this.cropStartX, this.cropStartY, this.cropWidth, this.cropHeight);
      
      // Reset the line style to solid
      this.canvasContext.setLineDash([]);
    }
  }

  toggleSquareMode() {
    this.squareModeEnabled = !this.squareModeEnabled;
    if (this.squareModeEnabled) {
      this.cropModeEnabled = false; 
      this.arrowModeEnabled = false; // Disable arrow mode
      this.isDragModeEnabled = false;
    }
  }

  toggleArrowMode() {
    this.arrowModeEnabled = !this.arrowModeEnabled;
    if (this.arrowModeEnabled) {
      this.cropModeEnabled = false;
      this.squareModeEnabled = false; // Disable square mode
      this.isDragModeEnabled = false;
    }
  }

  toggleCropMode() {
    this.cropModeEnabled = !this.cropModeEnabled;
    if (this.cropModeEnabled) {
      this.squareModeEnabled = false;
      this.arrowModeEnabled = false;
      this.isDragModeEnabled = false;
      // Clear any existing selections when entering crop mode
      this.clearSelection();
    }
  }
  
  clearSelection() {
    // Reset selection-related properties when exiting crop mode
    this.isSelecting = false;
    this.cropStartX = 0;
    this.cropStartY = 0;
    this.cropWidth = 0;
    this.cropHeight = 0;
  }

  startEditingComment(comment: Comment) {
    comment.editable = true;
  }

  saveEditedComment(comment: Comment, newText: string) {
    comment.text = newText;
    comment.editable = false;
    this.redrawCanvas();
  }

  cancelEditing(comment: Comment) {
    comment.editable = false;
  }

  removeComment(commentId: number) {
    const index = this.comments.findIndex((comment) => comment.id === commentId);

    if (index !== -1) {
      this.comments.splice(index, 1);
      this.redrawCanvas();
    }
  }

  zoomIn() {
    if (this.currentScale < this.maxScale) {
      this.currentScale += 0.1;
      this.redrawCanvas();
    }
  }

  zoomOut() {
    if (this.currentScale > this.minScale) {
      this.currentScale -= 0.1;
      this.redrawCanvas();
    }
  }

  toggleDragMode() {
    this.isDragModeEnabled = !this.isDragModeEnabled;
    
    // When entering drag mode, disable other modes
    if (this.isDragModeEnabled) {
      this.squareModeEnabled = false;
      this.arrowModeEnabled = false;
      this.cropModeEnabled = false;
      this.clearSelection();
    }
  }

  toggleDrag() {
    this.isDragging = !this.isDragging;
    if (this.isDragging) {
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onDragEnd);
    } else {
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.onDragEnd);
    }
  }

  // private dragStartX = 0;
  // private dragStartY = 0;

  onDrag = (event: MouseEvent) => {
    if (this.canvasContext && this.isDragging) {
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;

      this.imageX += deltaX;
      this.imageY += deltaY;

      this.redrawCanvas();

      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
    }
  }

  onDragEnd = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.onDragEnd);
  }

  rotateImage() {
    this.imageRotation += 90;
    this.redrawCanvas();
  }

  cropImage() {
    if (this.canvasContext && this.cropModeEnabled && this.cropWidth > 0 && this.cropHeight > 0) {
      const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
  
      // Create a new canvas to hold the cropped image
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
  
      if (croppedCtx) {
        // Set the size of the cropped canvas to the crop area
        croppedCanvas.width = this.cropWidth;
        croppedCanvas.height = this.cropHeight;
  
        // Draw the cropped portion of the main canvas onto the cropped canvas
        croppedCtx.drawImage(
          canvasElement,
          this.cropStartX,
          this.cropStartY,
          this.cropWidth,
          this.cropHeight,
          0,
          0,
          this.cropWidth,
          this.cropHeight
        );
  
        // Clear the main canvas and draw the cropped image back on it
        this.canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        this.canvasContext.drawImage(croppedCanvas, 0, 0, canvasElement.width, canvasElement.height);
  
        // Reset crop mode
        this.cropModeEnabled = false;
      } else {
        console.error('Cropped canvas context is null.');
      }
    }
  }
  

  private redrawCanvas() {
    const image = new Image();
    image.src = 'assets/top-view-desk.avif';

    image.onload = () => {
      const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');

      if (ctx) {
        canvasElement.width = image.width * this.currentScale;
        canvasElement.height = image.height * this.currentScale;

        ctx.translate(
          image.width * this.currentScale / 2 + this.imageX * this.currentScale,
          image.height * this.currentScale / 2 + this.imageY * this.currentScale
        );

        ctx.rotate((this.imageRotation * Math.PI) / 180);

        ctx.drawImage(
          image,
          -image.width * this.currentScale / 2,
          -image.height * this.currentScale / 2,
          image.width * this.currentScale,
          image.height * this.currentScale
        );

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.comments.forEach((comment) => {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'white';

          const x = comment.x * this.currentScale;
          const y = comment.y * this.currentScale;
          const width = comment.width * this.currentScale;
          const height = comment.height * this.currentScale;

          if (width > 0 && height > 0) {
            ctx.strokeRect(x, y, width, height);
            ctx.font = '14px Arial';
            ctx.fillText(comment.text, x + 5, y + 18);
          } else {
            const centerX = comment.x * this.currentScale;
            const centerY = comment.y * this.currentScale;
            const endX = (comment.x + comment.width) * this.currentScale;
            const endY = (comment.y + comment.height) * this.currentScale;
            const dx = endX - centerX;
            const dy = endY - centerY;
            const arrowSize = 10;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.closePath();

            const angle = Math.atan2(dy, dx);
            const angle1 = angle - Math.PI / 6;
            const angle2 = angle + Math.PI / 6;

            const arrowHead1X = endX - arrowSize * Math.cos(angle1);
            const arrowHead1Y = endY - arrowSize * Math.sin(angle1);
            const arrowHead2X = endX - arrowSize * Math.cos(angle2);
            const arrowHead2Y = endY - arrowSize * Math.sin(angle2);

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(arrowHead1X, arrowHead1Y);
            ctx.moveTo(endX, endY);
            ctx.lineTo(arrowHead2X, arrowHead2Y);
            ctx.stroke();
            ctx.closePath();

            const textX = (arrowHead1X + arrowHead2X) / 2 - ctx.measureText(comment.text).width / 2;
            const textY = (arrowHead1Y + arrowHead2Y) / 2 - 10;

            ctx.font = '14px Arial';
            ctx.fillText(comment.text, textX, textY);
          }
        });
      } else {
        console.error('Canvas context is null.');
      }
    };
  }
}






// import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

// interface Comment {
//   id: number;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   text: string;
//   timestamp: Date;
//   editable: boolean;
//   isArrow: boolean;
// }

// @Component({
//   selector: 'app-image-comment',
//   templateUrl: './image-comment.component.html',
//   styleUrls: ['./image-comment.component.css']
// })
// export class ImageCommentComponent implements OnInit {
//   @ViewChild('canvas') canvas!: ElementRef;

//   comments: Comment[] = [];
//   canvasContext: CanvasRenderingContext2D | null = null;
//   isSelecting = false;
//   selectionStartX = 0;
//   selectionStartY = 0;
//   selectionWidth = 0;
//   selectionHeight = 0;
//   squareModeEnabled = false;
//   arrowModeEnabled = false;
//   commentText: string = '';
//   showInput: boolean = false;

//   constructor() { }

//   ngOnInit() {
//     const image = new Image();
//     image.src = 'assets/top-view-desk.avif';

//     image.onload = () => {
//       const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
//       this.canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D;

//       if (this.canvasContext) {
//         canvasElement.width = image.width;
//         canvasElement.height = image.height;
//         this.canvasContext.drawImage(image, 0, 0, image.width, image.height);
//         this.redrawCanvas();
//       } else {
//         console.error('Canvas context is null.');
//       }
//     };
//   }

//   @HostListener('mousedown', ['$event'])
//   onMouseDown(event: MouseEvent) {
//     if (this.squareModeEnabled && this.canvasContext) {
//       this.isSelecting = true;
//       this.selectionStartX = event.offsetX;
//       this.selectionStartY = event.offsetY;
//       this.selectionWidth = 0;
//       this.selectionHeight = 0;
//     }
//     if (this.arrowModeEnabled && this.canvasContext) {
//       this.isSelecting = true;
//       this.selectionStartX = event.offsetX;
//       this.selectionStartY = event.offsetY;
//     }
//   }

//   @HostListener('mousemove', ['$event'])
//   onMouseMove(event: MouseEvent) {
//     if (this.isSelecting && this.canvasContext && this.squareModeEnabled) {
//       this.selectionWidth = event.offsetX - this.selectionStartX;
//       this.selectionHeight = event.offsetY - this.selectionStartY;
//       this.drawSelection();
//     }
//     if (this.isSelecting && this.canvasContext && this.arrowModeEnabled) {
//       // Draw arrow during mouse move, but do not update selection
//       this.redrawCanvas();
//       this.drawArrow(this.selectionStartX, this.selectionStartY, event.offsetX, event.offsetY);
//     }
//   }

//   @HostListener('mouseup', ['$event'])
//   onMouseUp(event: MouseEvent) {
//     if (this.squareModeEnabled && this.canvasContext) {
//       this.isSelecting = false;
//       this.showInput = true;
//     }
//     if (this.arrowModeEnabled && this.canvasContext) {
//       this.isSelecting = false;
//       this.showInput = true;
//     }
//   }

//   drawSelection() {
//     if (this.canvasContext) {
//       this.redrawCanvas();
//       this.canvasContext.strokeStyle = 'red';
//       this.canvasContext.strokeRect(
//         Math.min(this.selectionStartX, this.selectionStartX + this.selectionWidth),
//         Math.min(this.selectionStartY, this.selectionStartY + this.selectionHeight),
//         Math.abs(this.selectionWidth),
//         Math.abs(this.selectionHeight)
//       );
//     }
//   }

//   drawArrow(startX: number, startY: number, endX: number, endY: number) {
//     if (this.canvasContext) {
//       this.canvasContext.strokeStyle = 'red';
//       this.canvasContext.lineWidth = 2;
//       this.canvasContext.beginPath();
//       this.canvasContext.moveTo(startX, startY);
//       this.canvasContext.lineTo(endX, endY);
//       this.canvasContext.stroke();
//     }
//   }

//   toggleSquareMode() {
//     this.squareModeEnabled = !this.squareModeEnabled;
//     this.arrowModeEnabled = false;
//   }

//   toggleArrowMode() {
//     this.arrowModeEnabled = !this.arrowModeEnabled;
//     this.squareModeEnabled = false;
//   }

//   addComment() {
//     if (this.commentText.trim() !== '') {
//       let commentX = Math.min(this.selectionStartX, this.selectionStartX + this.selectionWidth);
//       let commentY = Math.min(this.selectionStartY, this.selectionStartY + this.selectionHeight);
//       let commentWidth = Math.abs(this.selectionWidth);
//       let commentHeight = Math.abs(this.selectionHeight);

//       if (this.arrowModeEnabled) {
//         // Adjust coordinates for arrow comments
//         commentWidth = Math.abs(this.selectionStartX - this.selectionWidth);
//         commentHeight = Math.abs(this.selectionStartY - this.selectionHeight);
//       }

//       const newComment: Comment = {
//         id: Date.now(),
//         x: commentX,
//         y: commentY,
//         width: commentWidth,
//         height: commentHeight,
//         text: this.commentText,
//         timestamp: new Date(),
//         editable: false,
//         isArrow: this.arrowModeEnabled
//       };
//       this.comments.push(newComment);

//       this.commentText = '';
//       this.showInput = false;

//       this.redrawCanvas();
//     }
//   }

//   startEditingComment(comment: Comment) {
//     comment.editable = true;
//   }

//   saveEditedComment(comment: Comment, newText: string) {
//     comment.text = newText;
//     comment.editable = false;
//     this.redrawCanvas();
//   }

//   cancelEditing(comment: Comment) {
//     comment.editable = false;
//   }

//   removeComment(commentId: number) {
//     const index = this.comments.findIndex((comment) => comment.id === commentId);

//     if (index !== -1) {
//       this.comments.splice(index, 1);
//       this.redrawCanvas();
//     }
//   }

//   private redrawCanvas() {
//     const image = new Image();
//     image.src = 'assets/top-view-desk.avif';

//     image.onload = () => {
//       const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
//       const ctx = canvasElement.getContext('2d');

//       if (ctx) {
//         canvasElement.width = image.width;
//         canvasElement.height = image.height;
//         ctx.drawImage(image, 0, 0, image.width, image.height);

//         this.comments.forEach((comment) => {
//           ctx.strokeStyle = 'red';
//           ctx.lineWidth = 2;
//           ctx.fillStyle = 'white';

//           if (comment.isArrow) {
//             // Draw comments as arrows
//             const startX = comment.x;
//             const startY = comment.y;
//             const endX = comment.x + comment.width;
//             const endY = comment.y + comment.height;
//             const dx = endX - startX;
//             const dy = endY - startY;
//             const arrowSize = 10;

//             ctx.beginPath();
//             ctx.moveTo(startX, startY);
//             ctx.lineTo(endX, endY);
//             ctx.stroke();
//             ctx.closePath();

//             const angle = Math.atan2(dy, dx);
//             const angle1 = angle - Math.PI / 6;
//             const angle2 = angle + Math.PI / 6;

//             const arrowHead1X = endX - arrowSize * Math.cos(angle1);
//             const arrowHead1Y = endY - arrowSize * Math.sin(angle1);
//             const arrowHead2X = endX - arrowSize * Math.cos(angle2);
//             const arrowHead2Y = endY - arrowSize * Math.sin(angle2);

//             ctx.beginPath();
//             ctx.moveTo(endX, endY);
//             ctx.lineTo(arrowHead1X, arrowHead1Y);
//             ctx.moveTo(endX, endY);
//             ctx.lineTo(arrowHead2X, arrowHead2Y);
//             ctx.stroke();
//             ctx.closePath();

//             const textX = (arrowHead1X + arrowHead2X) / 2 - ctx.measureText(comment.text).width / 2;
//             const textY = (arrowHead1Y + arrowHead2Y) / 2 - 10;

//             ctx.font = '14px Arial';
//             ctx.fillText(comment.text, textX, textY);
//           } else {
//             // Draw comments as rectangles
//             ctx.strokeRect(comment.x, comment.y, comment.width, comment.height);
//             ctx.font = '14px Arial';
//             ctx.fillText(comment.text, comment.x + 5, comment.y + 18);
//           }
//         });
//       } else {
//         console.error('Canvas context is null.');
//       }
//     };
//   }
// }




















// import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

// interface Comment {
//   id: number;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   text: string;
//   timestamp: Date;
//   editable: boolean;
//   arrowX: number;
//   arrowY: number;
// }

// @Component({
//   selector: 'app-image-comment',
//   templateUrl: './image-comment.component.html',
//   styleUrls: ['./image-comment.component.css']
// })
// export class ImageCommentComponent implements OnInit {
//   @ViewChild('canvas') canvas!: ElementRef;

//   comments: Comment[] = [];
//   canvasContext: CanvasRenderingContext2D | null = null;
//   isSelecting = false;
//   selectionStartX = 0;
//   selectionStartY = 0;
//   selectionWidth = 0;
//   selectionHeight = 0;
//   selectedCommentIndex = -1;
//   resizeHandleRadius = 5;

//   constructor() { }

//   ngOnInit() {
//     const image = new Image();
//     image.src = 'assets/top-view-desk.avif';

//     image.onload = () => {
//       const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
//       this.canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D;

//       if (this.canvasContext) {
//         canvasElement.width = image.width;
//         canvasElement.height = image.height;
//         this.canvasContext.drawImage(image, 0, 0, image.width, image.height);
//       } else {
//         console.error('Canvas context is null.');
//       }
//     };
//   }

//   @HostListener('mousedown', ['$event'])
//   onMouseDown(event: MouseEvent) {
//     const x = event.offsetX;
//     const y = event.offsetY;

//     if (this.isSelecting) {
//       // Check for resize handles
//       if (this.selectedCommentIndex !== -1) {
//         const comment = this.comments[this.selectedCommentIndex];
//         if (this.isInResizeHandle(x, y, comment)) {
//           this.startResizing(x, y, comment);
//           return;
//         }
//       }
//     }

//     if (this.canvasContext) {
//       this.isSelecting = true;
//       this.selectionStartX = x;
//       this.selectionStartY = y;
//       this.selectionWidth = 0;
//       this.selectionHeight = 0;
//       this.selectedCommentIndex = -1;
//     }
//   }

//   @HostListener('mousemove', ['$event'])
//   onMouseMove(event: MouseEvent) {
//     const x = event.offsetX;
//     const y = event.offsetY;

//     if (this.isSelecting) {
//       if (this.isResizing) {
//         this.resizeSelection(x, y);
//       } else {
//         this.selectionWidth = x - this.selectionStartX;
//         this.selectionHeight = y - this.selectionStartY;

//         // Check if mouse is inside a comment box
//         this.selectedCommentIndex = this.comments.findIndex(comment => {
//           return x >= comment.x && x <= comment.x + comment.width &&
//                  y >= comment.y && y <= comment.y + comment.height;
//         });
//       }

//       this.drawSelection();
//     }
//   }

//   @HostListener('mouseup', ['$event'])
//   onMouseUp(event: MouseEvent) {
//     if (this.isSelecting && this.canvasContext) {
//       if (this.isResizing) {
//         this.isResizing = false;
//       } else {
//         this.isSelecting = false;
//         const x = this.selectionStartX;
//         const y = this.selectionStartY;
//         const width = this.selectionWidth;
//         const height = this.selectionHeight;

//         if (width > 0 && height > 0) {
//           const commentText = prompt('Enter your comment:');
//           if (commentText) {
//             const arrowX = x + width / 2;
//             const arrowY = y - 20; // Adjust the vertical position
//             const newComment: Comment = {
//               id: Date.now(),
//               x,
//               y,
//               width,
//               height,
//               text: commentText,
//               timestamp: new Date(),
//               editable: false,
//               arrowX,
//               arrowY
//             };
//             this.comments.push(newComment);
//             this.redrawCanvas();
//           }
//         }
//       }
//     }
//   }

//   isResizing = false;
//   resizeDirection: 'nw' | 'ne' | 'se' | 'sw' | null = null;

//   startResizing(x: number, y: number, comment: Comment) {
//     this.isResizing = true;
//     const centerX = comment.x + comment.width / 2;
//     const centerY = comment.y + comment.height / 2;

//     if (x < centerX) {
//       if (y < centerY) {
//         this.resizeDirection = 'nw'; // Northwest
//       } else {
//         this.resizeDirection = 'sw'; // Southwest
//       }
//     } else {
//       if (y < centerY) {
//         this.resizeDirection = 'ne'; // Northeast
//       } else {
//         this.resizeDirection = 'se'; // Southeast
//       }
//     }
//   }

//   resizeSelection(x: number, y: number) {
//     if (this.selectedCommentIndex !== -1 && this.resizeDirection) {
//       const comment = this.comments[this.selectedCommentIndex];
//       switch (this.resizeDirection) {
//         case 'nw':
//           comment.x = x;
//           comment.y = y;
//           comment.width += comment.x - x;
//           comment.height += comment.y - y;
//           break;
//         case 'ne':
//           comment.y = y;
//           comment.width = x - comment.x;
//           comment.height += comment.y - y;
//           break;
//         case 'se':
//           comment.width = x - comment.x;
//           comment.height = y - comment.y;
//           break;
//         case 'sw':
//           comment.x = x;
//           comment.width += comment.x - x;
//           comment.height = y - comment.y;
//           break;
//       }
//       this.redrawCanvas();
//     }
//   }

//   isInResizeHandle(x: number, y: number, comment: Comment) {
//     const centerX = comment.x + comment.width / 2;
//     const centerY = comment.y + comment.height / 2;
//     const handleX = centerX - this.resizeHandleRadius;
//     const handleY = centerY - this.resizeHandleRadius;
//     const handleSize = this.resizeHandleRadius * 2;

//     return (
//       x >= handleX && x <= handleX + handleSize &&
//       y >= handleY && y <= handleY + handleSize
//     );
//   }

//   drawSelection() {
//     if (this.canvasContext) {
//       this.redrawCanvas();
//       this.canvasContext.strokeStyle = 'red';
//       this.canvasContext.strokeRect(this.selectionStartX, this.selectionStartY, this.selectionWidth, this.selectionHeight);
//     }
//   }

//   startEditingComment(comment: Comment) {
//     comment.editable = true;
//   }

//   saveEditedComment(comment: Comment, newText: string) {
//     comment.text = newText;
//     comment.editable = false;
//     this.redrawCanvas();
//   }

//   cancelEditing(comment: Comment) {
//     comment.editable = false;
//   }

//   removeComment(commentId: number) {
//     const index = this.comments.findIndex((comment) => comment.id === commentId);

//     if (index !== -1) {
//       this.comments.splice(index, 1);
//       this.redrawCanvas();
//     }
//   }

//   private redrawCanvas() {
//     const image = new Image();
//     image.src = 'assets/top-view-desk.avif';

//     image.onload = () => {
//       const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
//       const ctx = canvasElement.getContext('2d');

//       if (ctx) {
//         canvasElement.width = image.width;
//         canvasElement.height = image.height;
//         ctx.drawImage(image, 0, 0, image.width, image.height);

//         this.comments.forEach((comment) => {
//           ctx.strokeStyle = 'red';
//           ctx.strokeRect(comment.x, comment.y, comment.width, comment.height);

//           ctx.font = '14px Arial';
//           ctx.fillStyle = 'white';
//           ctx.fillText(comment.text, comment.arrowX - ctx.measureText(comment.text).width / 2, comment.y - 30); // Adjust the vertical position
          
//           // Draw arrow
//           ctx.beginPath();
//           ctx.moveTo(comment.arrowX, comment.arrowY);
//           ctx.lineTo(comment.x + comment.width / 2, comment.y);
//           ctx.lineWidth = 2;
//           ctx.strokeStyle = 'red';
//           ctx.stroke();
//         });
//       } else {
//         console.error('Canvas context is null.');
//       }
//     };
//   }
// }
