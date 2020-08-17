import { c } from "atomico";
import html from "atomico/html";

const Footer = () => {
  return html`
    <host>
      <p>
        Created by rongying. I know I butchered the font pairings. Font used: <a href="https://www.recursive.design/">Recursive.</a>
      </p>
      <a href="https://github.com/kohrongying/variable-fonts-primer">Github Source Code</a>
    </host>`;
}


customElements.define("footer-component", c(Footer));