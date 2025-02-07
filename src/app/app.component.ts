import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { gsap } from 'gsap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Valentine';

  public name: string = '';
  showInput: boolean = false;
  inputError: string = '';

  inputPass: boolean = false;
  showSecondButtons = false;

  showImage:boolean =false;

  oxiStyle: { [key: string]: string } = {};

  @ViewChild('container', { static: false }) container!: ElementRef;
  @ViewChild('questionDiv') set questionDiv(content: ElementRef) {
    if (content) {
      // Animate the first question only once.
      if (!this.inputPass && !this.firstAnimated) {
        this.animateText(content.nativeElement).then(() => {
          this.showInput = true;
        });
        this.firstAnimated = true;
      }
      // Animate the second question only once.
      if (this.inputPass && !this.secondAnimated) {
        this.animateText(content.nativeElement).then(() => {
          // Nothing additional to reveal here.
          this.showSecondButtons = true;
        });
        this.secondAnimated = true;
      }

      if(this.showImage && this.secondAnimated){
        this.animateText(content.nativeElement).then(() => {
          // Nothing additional to reveal here.
        });
      }

    }
  }

  // Flags to determine which question block has been animated.

  firstAnimated = false;
  secondAnimated = false;



  // Animation parameters
  typeSpeed = 100;      // milliseconds per character
  paragraphDelay = 500; // delay between paragraphs



  ngAfterViewInit() {
    this.initializeAnimation();

  }
  // Animate the text of all paragraphs within the given element.
  async animateText(element: HTMLElement): Promise<void> {
    const paragraphs: HTMLElement[] = Array.from(element.querySelectorAll('p'));
    // Save the full text in each paragraph and clear it.
    paragraphs.forEach((p: HTMLElement) => {
      p.dataset['fullText'] = p.textContent || '';
      p.textContent = '';
    });

    // Type each paragraph sequentially.
    for (const p of paragraphs) {
      await this.typeParagraph(p);
      await this.delay(this.paragraphDelay);
    }
  }

  // Animate one paragraph character by character.
  typeParagraph(p: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      const fullText = p.dataset['fullText'] || '';
      let charIndex = 0;
      const typeChar = () => {
        if (charIndex < fullText.length) {
          p.textContent += fullText.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, this.typeSpeed);
        } else {
          resolve();
        }
      };
      typeChar();
    });
  }

  // Utility delay function.
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  initializeAnimation() {
    // Randomize the order of branches (all and for specific positions)
    const branchesRandomOrder = Array.from(document.querySelectorAll('[id^=BranchGroup]'))
      .sort(() => 0.5 - Math.random());
    const branchesRandomOrderLeft = Array.from(document.querySelectorAll('[id^=BranchGroup-left]'))
      .sort(() => 0.5 - Math.random());
    const branchesRandomOrderRight = Array.from(document.querySelectorAll('[id^=BranchGroup-right]'))
      .sort(() => 0.5 - Math.random());
    const branchesRandomOrderBottom = Array.from(document.querySelectorAll('[id^=BranchGroup-bottom]'))
      .sort(() => 0.5 - Math.random());

    const master = gsap.timeline();
    master
      .add(this.mainSetUp(branchesRandomOrder, branchesRandomOrderLeft, branchesRandomOrderRight, branchesRandomOrderBottom))
      .add(this.branchMaster(branchesRandomOrder));


  }

  mainSetUp(branches: Element[], left: Element[], right: Element[], bottom: Element[]) {
    return gsap.timeline()
      .set('[id^=petal-]', { fill: '#f00' })
      .set(['[id^=flower-]', '[id^=bud-]', '[id^=bloom-]'], { scale: 0, transformOrigin: 'center center' })
      .set(left, { transformOrigin: 'bottom left' })
      .set(right, { transformOrigin: 'bottom right' })
      .set(bottom, { transformOrigin: 'bottom center' })
      .set('#BranchGroup-left-1', { transformOrigin: '0% 20%' })
      .set('#BranchGroup-right-16', { transformOrigin: '100% 20%' })
      .set(branches, { scale: 0 })
      .set(this.container.nativeElement, { autoAlpha: 1 });
  }

  branchMaster(branches: Element[]) {
    return gsap.timeline()
      .add(this.wholeBranchGrowIn(branches))
      .add(this.smallBranchesSway());
  }

  wholeBranchGrowIn(branches: Element[]) {
    const tl = gsap.timeline();
    // Reduced per-branch delay for faster appearance
    branches.forEach((branch, index) => {
      tl.to(branch, {
        scale: 1,
        duration: 0.5, // slightly reduced duration
        ease: 'power1.out',
        delay: 0,
        onStart: () => this.flowersBloom(branch),
        onComplete: () => this.currentBranchSwaying(branch)
      });
    });
    return tl;
  }

  flowersBloom(branch: Element): void {
    // Reduced initial delay for faster bloom effect
    const tl = gsap.timeline({ delay: 0.2 });
    console.log('Blooming branch:', branch);
    // Find the flower parts within the current branch
    const petals = branch.querySelectorAll('[id^=petal-]');
    const flowers = branch.querySelectorAll('[id^=flower-]');
    const buds = branch.querySelectorAll('[id^=bud-]');
    const blooms = branch.querySelectorAll('[id^=bloom-]');

    tl.to([flowers, buds, blooms], { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.3 })
      .to(flowers, { rotation: 45, duration: 1, ease: 'sine.out' })
      .to(petals, { fill: '#f00', duration: 0.4 });
  }

  currentBranchSwaying(branch: Element): void {
    // Decide rotation based on the branch's data-position attribute
    let rotationValue = branch.getAttribute('data-position') === 'left' ? -10 :
      branch.getAttribute('data-position') === 'right' ? 5 : 10;

    gsap.timeline({ yoyo: true, repeat: -1 })
      .to(branch, { rotation: rotationValue, duration: 1, ease: 'sine.inOut' });
  }

  smallBranchesSway() {
    const smallBranches = Array.from(document.querySelectorAll('[id^=smallbranch-group]'));

    return gsap.timeline({ yoyo: true, repeat: -1 })
      .to(smallBranches, { rotation: 5, duration: 1.5 + Math.random(), ease: 'sine.inOut', stagger: Math.random() / 1.2 })
      .to('#smallbranch-group-3-B, #smallbranch-group-8-A', { rotation: -5, transformOrigin: '100% 50%', duration: 1 })
      .to('#smallbranch-group-5-A', { rotation: -5, transformOrigin: '50% 100%', duration: 1.5 + Math.random() })
      .to('#smallbranch-group-2-C, #smallbranch-group-A, #smallbranch-group-12-A', { rotation: -5, transformOrigin: '100% 100%', duration: 1.5 });
  }


  dodge(): void {
    // Generate a random offset (in pixels) for left and top.
    // Adjust these ranges as needed to make the button dodge "like crazy."
    const randomX = Math.floor(Math.random() * 300); // between -100 and +100 px
    const randomY = Math.floor(Math.random() * 300) ; // between -100 and +100 px

    // Update the OXI button style.
    this.oxiStyle = {
      position: 'relative',
      left: randomX + 'px',
      top: randomY + 'px',
      transition: 'all 0.2s'
    };
  }

  // Prevent any click action on the OXI button.
  preventClick(event: MouseEvent): void {
    event.preventDefault();
    // Optionally, you could call dodge() here as well.
    this.dodge();
  }

  agree(){
    
    this.showImage = true;
  }

  checkName() {

    const input = this.name.toLocaleLowerCase();

    if (input === 'maria' || input === 'μαρια' || input === 'μαρία') {
      this.inputPass = true;
    } else {

      this.name = '';
      this.inputError = 'Λάθος Όνομα ΦΥΓΕΕΕΕΕ!'

    }

  }

}
