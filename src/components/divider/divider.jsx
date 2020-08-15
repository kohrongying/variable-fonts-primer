import { h, c } from "atomico";
import { css } from "otion";

const Divider = () => {
  return (
    <host>
      <hr className={css({
        marginTop: 50
      })}></hr>
    </host>
  )
}


customElements.define("divider-component", c(Divider));
