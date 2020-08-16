import { h, c } from "atomico";
import { css } from "otion";

const headingStyle = `{
  "fontSize": 36,
  "backgroundColor": "white",
  "padding": 0,
  "paddingRight": 20
}`

const bodyStyle = `{
  "backgroundColor": "white",
  "padding": 0,
  "marginTop": 10,
  "paddingRight": 20
}`


const FontPairings = () => {
  return (
    <host>
      <div className={css({ paddingTop: 20 })}>
        <h2>FONT PAIRINGS</h2>

        <div class="cols">

          <div>
            <span>Variation 1</span>
              <text-component 
                mono='0.5'
                wght='700'
                textStyle={headingStyle}
                text='Six Strong is Stronger Together'
              ></text-component>
              <text-component 
                wght='300'
                textStyle={bodyStyle}
              ></text-component>
            </div>

          <div>
            <span>Variation 2</span>
            <text-component 
              wght='700'
              mono='0.4'
              CRSV='1'
              textStyle={headingStyle}
              text='Why you should eat more vegetables'
            ></text-component>
            <text-component 
                wght='300'
                fontFamily="sans-serif"
                textStyle={bodyStyle}
              ></text-component>
          </div>

          <div>
            <span>Variation 3</span>
            <text-component 
              wght='700'
              casl='0.5'
              mono='0.3'
              textStyle={headingStyle}
              text='10 Reasons you need to follow me on Twitter'
            ></text-component>
            <text-component 
                wght='300'
                casl='1'
                slnt='-14'
                textStyle={bodyStyle}
                text='This is really not clickbait. Reason #4 will explain it all.'
              ></text-component>
          </div>

          <div>
            <span>Variation 4</span>
            <text-component 
              wght='500'
              slnt='-10'
              casl='1'
              CRSV='1'
              textStyle={headingStyle}
              text='10 Reasons you need to follow me on Twitter'
            ></text-component>
            <text-component 
                wght='300'
                casl='0'
                CRSV='0.5'
                textStyle={bodyStyle}
                text='This is really not clickbait. Reason #4 will explain it all.'
              ></text-component>
          </div>
        </div>
      </div>
    </host>
  )
}

customElements.define("font-pairings", c(FontPairings))