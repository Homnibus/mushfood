import {animate, query, style, transition, trigger} from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
  transition('* => *', [
    query(':enter',
      [
        style({opacity: 0})
      ],
      {optional: true}
    ),

    query(':leave',
      [
        style({
          opacity: 1,
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
        }),
        animate('0.2s', style({opacity: 0}))
      ],
      {optional: true}
    ),

    query(':enter',
      [
        style({opacity: 0}),
        animate('0.2s', style({opacity: 1}))
      ],
      {optional: true}
    )

  ])
]);
