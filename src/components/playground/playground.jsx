import { h, c, useState } from "atomico";
import { css } from "otion";

const Playground = () => {
  const [mono, setMono] = useState(0)
  const [casl, setCasl] = useState(0)
  const [wght, setWght] = useState(400)
  const [slnt, setSlnt] = useState(0)
  const [CRSV, setCRSV] = useState(0)

  return (
    <host>
      <text-component
        mono={mono}
        casl={casl}
        wght={wght}
        slnt={slnt}
        CRSV={CRSV}
        textStyle='{"fontSize": 50, "margin": "20px 0"}'
      >
      </text-component>

      <div className={css({
        fontVariationSettings: `'MONO' 1, 'CASL' 0, 'wght' 400, 'slnt' 0, 'CRSV' 0`,
      })}>
        font-variation-settings: 
        <playground-slider
          className={css({ flex: 3 })}
          name="MONO"
          value={mono}
          oninput={(event) => setMono(event.target.value)}
        ></playground-slider>
      
        <playground-slider
          className={css({ flex: 3 })}
          name="CASL"
          value={casl}
          oninput={(event) => setCasl(event.target.value)}
        ></playground-slider>  

        <playground-slider
          className={css({ flex: 3 })}
          name="wght"
          value={wght}
          min="300"
          max="1000"
          step="100"
          oninput={(event) => setWght(event.target.value)}
        ></playground-slider>
      
        <playground-slider
          className={css({ flex: 3 })}
          name="slnt"
          value={slnt}
          min="-15"
          max="0"
          step="1"
          oninput={(event) => setSlnt(event.target.value)}
        ></playground-slider>

        <playground-slider
          className={css({ flex: 3 })}
          name="CRSV"
          value={CRSV}
          oninput={(event) => setCRSV(event.target.value)}
        ></playground-slider>
      </div>
    </host>
  )
}

customElements.define("playground-component", c(Playground));