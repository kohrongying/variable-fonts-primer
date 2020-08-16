import { h, c, useState } from "atomico";
import { css } from "otion";

const MyComponent = ({ mono, casl, wght, slnt, CRSV, textStyle, text, fontFamily }) => {
  const copyToClipboard = () => {
    const style = `
      font-variation-settings: 'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV},
      font-family: ${fontFamily}
    `
    navigator.clipboard.writeText(style).then(function() {
      // console.log('Async: Copying to clipboard was successful!');
      setCopied(true)
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  const [copied, setCopied] = useState(false)

  return (
    <host>
      <div className={css({ 
          fontVariationSettings: `'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV}`,
          fontFamily,
          position: "relative",
          padding: 20,
          backgroundColor: "#eaeaea",
          borderRadius: "10px",
          fontSize: "24px",
          marginTop: 8,
          ...JSON.parse(textStyle)
        })
      }>
        {text}
        <div className={css({
          position: "absolute",
          top: 0, right: 2,
          ":hover": {
            cursor: "pointer"
          }
        })} onclick={copyToClipboard}>
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#4CAF50" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"/>
              <path d="M5 12l5 5l10 -10" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="20" height="20" viewBox="0 0 24 24" stroke-width="1" stroke="#000000aa" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"/>
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
          )}

        </div>
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
  },
  text: {
    type: String,
    value: 'The quick brown fox jumps over the lazy dog'
  },
  fontFamily: {
    type: String,
    value: "Recursive"
  }
}

customElements.define("text-component", c(MyComponent));