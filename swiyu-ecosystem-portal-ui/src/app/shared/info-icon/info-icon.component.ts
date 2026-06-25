import {Component} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ObEToggleType, ObPopoverDirective} from '@oblique/oblique';

@Component({
  selector: 'app-info-icon',
  imports: [MatIcon, ObPopoverDirective],
  templateUrl: './info-icon.component.html',
  styleUrl: './info-icon.component.scss'
})
export class InfoIconComponent {
  protected toggleTypeHover = ObEToggleType.HOVER;
}
