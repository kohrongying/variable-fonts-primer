import { h, c } from "atomico";

const Footer = () => {
  return (
    <host>
      <p>
        Created by rongying. I know I butchered the font pairings. Font used: <a href="https://www.recursive.design/">Recursive.</a>
      </p>
      <a href="https://github.com/kohrongying/variable-fonts-primer">Github Source Code</a>
    </host>
  )
}


customElements.define("footer-component", c(Footer));