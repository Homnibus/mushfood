import {
  trigger,
  transition,
  style,
  sequence,
  animate,
} from "@angular/animations";

export const flyInOutTransition = trigger("flyInOutTransition", [
  transition("void => *", [
    style({
      height: 0,
      "padding-top": 0,
      "padding-bottom": 0,
      opacity: 0,
      transform: "translateY(-100%)",
    }),
    sequence([
      animate(
        "0.1s ease-in-out",
        style({
          height: "*",
          "padding-top": "*",
          "padding-bottom": "*",
        })
      ),
      animate(
        "0.3s ease-in-out",
        style({
          opacity: 1,
          transform: "translateY(0)",
        })
      ),
    ]),
  ]),
  transition("* => void", [
    style({
      opacity: 1,
      height: "*",
      "padding-top": "*",
      "padding-bottom": "*",
      transform: "translateY(0)",
    }),
    sequence([
      animate(
        "0.3s ease-in-out",
        style({
          opacity: 0,
          transform: "translateY(-100%)",
        })
      ),
      animate(
        "0.1s ease-in-out",
        style({
          height: 0,
          "padding-top": 0,
          "padding-bottom": 0,
        })
      ),
    ]),
  ]),
]);
