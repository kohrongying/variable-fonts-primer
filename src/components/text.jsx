import { h, c, useEffect } from "atomico";
import { css } from "otion";

const MyComponent = ({ mono, casl, wght, slnt, CRSV }) => {
  return (
    <host>
      <h3 className={css({ 
          fontVariationSettings: `'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV}`,
          padding: 20,
          backgroundColor: "lightgrey",
          borderRadius: "10px",
          fontSize: "20px"
        })
      }>
        The quick brown fox jumps over the lazy dog
      </h3>
    </host>
  )
}


MyComponent.props = {
  mono: {
    type: Number,
    value: 0
  },
  casl: {
    type: Number,
    value: 0
  },
  wght: {
    type: Number,
    value: 400
  },
  slnt: {
    type: Number,
    value: 0
  },
  CRSV: {
    type: Number,
    value: 0
  }
}

customElements.define("text-component", c(MyComponent));