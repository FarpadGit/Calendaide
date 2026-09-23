import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-label-with-hint',
  imports: [CommonModule, TooltipModule],
  template: `<label [for]="for" [ngClass]="{ flex: endAlign }">
      {{ labelText }}
      <span
        class="hint-icon"
        [pTooltip]="tooltipGeneric"
        tooltipPosition="right"
        [dt]="{ maxWidth: 'min(45rem, 190vw)' }"
        >?</span
      >
    </label>
    <ng-template #tooltipGeneric>
      <div class="tooltip">
        <ng-content />
        @if (isDemoUser) {
          <div>(** Demó felhasználóként semmilyen változást nem tudsz elmenteni **)</div>
        }
      </div>
    </ng-template>`,
  styles: `
    .flex {
      display: flex;
      justify-content: space-between;
    }

    .hint-icon {
      display: inline-block;
      user-select: none;
      background-color: var(--p-primary-50);
      border-radius: 9999px;
      width: 1.25rem;
      height: 1.25rem;
      text-align: center;
    }

    .tooltip {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
})
export class LabelWithHint {
  @Input() for: string = '';
  @Input() labelText: string = '';
  @Input() isDemoUser: boolean = false;
  @Input() endAlign: boolean = true;
}
