import { h, c } from "atomico";

let stylesheet = `
  .slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 60%;
    height: 15px; /* Specified height */
    background: #d3d3d3; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
    border-radius: 50px;
  }
  .slider-text {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .slider-text > span {
    flex: 1;
    margin: 10px 20px;
  }
`
const PlaygroundSlider = ({ name, value, min, max, step, oninput }) => {
  return (
    <host>
      <style>{stylesheet}</style>
      <div class="slider-text">
        <span>"{name}" {value}
        {name === "CRSV" ? ';' : ','}
        </span>

        <input type="range" min={min} max={max} step={step} value={value} id={name} class="slider" oninput={oninput} />
      </div>
    </host>
  )
}

PlaygroundSlider.props = {
  name: String,
  value: Number,
  props: String,
  min: {
    type: Number,
    value: 0
  },
  max: {
    type: Number,
    value: 1
  },
  step: {
    type: Number,
    value: 0.05
  }
}

customElements.define("playground-slider", c(PlaygroundSlider));