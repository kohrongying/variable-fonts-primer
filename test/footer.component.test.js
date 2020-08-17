import "../src/components/footer/footer.js"
import { fixture, expect } from '@open-wc/testing';

describe("Footer Component", () => {
  it('renders author name', async () => {
    const el = await fixture('<footer-component></footer-component>');
    expect(el.querySelector('p').innerHTML).to.contain('rongying')
  });

  it('renders github source code', async () => {
    const el = await fixture('<footer-component></footer-component>');

    expect(el.querySelectorAll('a')[1].href).to.contain('github')
  });
});