import { h, c, useState } from "atomico";

const BlockComponent = ({ header, attr, min, max }) => {
  const [maxInput] = useState(JSON.parse(max))
  const [minInput] = useState(JSON.parse(min))

  const maxAttributes = {}
  maxAttributes[attr] = maxInput.value

  const minAttributes = {}
  minAttributes[attr] = minInput.value

  return (
    <host>
      <style>{`
      .cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
      }
      `}</style>
      <div>
        <h2>{header}</h2>
        <div class="cols">
          <div>
            <span>{maxInput.description}</span>
            <text-component {...maxAttributes}></text-component>
          </div>

          <div>
            <span>{minInput.description}</span>
            <text-component {...minAttributes}></text-component>
          </div>
        </div>
      </div>
    </host>
  )
}

BlockComponent.props = {
  header: String,
  attr: String,
  min: String,
  max: String
}

customElements.define("block-component", c(BlockComponent));
