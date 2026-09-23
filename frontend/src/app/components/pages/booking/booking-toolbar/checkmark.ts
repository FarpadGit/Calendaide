import { Component } from '@angular/core';

@Component({
  selector: 'app-checkmark',
  template: ` <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 214 214" class="check-circle">
    <g fill="none" stroke="currentColor" stroke-width="2">
      <circle
        class="semi-transparent"
        fill="currentColor"
        opacity="0.15"
        cx="107"
        cy="107"
        r="72"
      ></circle>
      <circle class="colored" fill="currentColor" cx="107" cy="107" r="72" opacity="0.8"></circle>
      <polyline
        stroke="#fff"
        stroke-width="10"
        points="73.5,107.8 93.7,127.9 142.2,79.4"
        style="stroke-dasharray: 50%, 50%; stroke-dashoffset: 100%"
      />
    </g>
  </svg>`,

  styles: `
    svg.check-circle {
      color: #17c964;
    }

    @keyframes checkmark {
      0% {
        stroke-dashoffset: 50%;
      }
      100% {
        stroke-dashoffset: 0px;
      }
    }

    svg.check-circle polyline {
      animation: checkmark 0.5s cubic-bezier(0.55, 0.2, 0.71, -0.04) 0.7s backwards;
    }

    @keyframes grow-circle {
      0% {
        r: 0;
      }
    }
    @keyframes grow-circle-bigger {
      50% {
        opacity: 0.11;
      }
      100% {
        r: 100;
        opacity: 0;
      }
    }
    svg.check-circle circle.semi-transparent {
      animation:
        grow-circle 0.45s cubic-bezier(0.66, 0.23, 0.51, 1.23) backwards,
        grow-circle-bigger 0.9s linear 1.1s forwards;
    }
    svg.check-circle circle.colored {
      animation: grow-circle 0.5s cubic-bezier(0.66, 0.23, 0.51, 1.23) 0.25s backwards;
    }
  `,
})
export class Checkmark {}
