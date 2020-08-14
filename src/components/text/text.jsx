import { h, c } from "atomico";
import { css } from "otion";

const MyComponent = ({ mono, casl, wght, slnt, CRSV, textStyle }) => {
  return (
    <host>
      <div className={css({ 
          fontVariationSettings: `'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV}`,
          padding: 20,
          backgroundColor: "#eaeaea",
          borderRadius: "10px",
          fontSize: "24px",
          marginTop: 8,
          ...JSON.parse(textStyle)
        })
      }>
        The quick brown fox jumps over the lazy dog
      </div>
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
  },
  textStyle: {
    type: String,
    value: '{}'
  }
}

customElements.define("text-component", c(MyComponent));