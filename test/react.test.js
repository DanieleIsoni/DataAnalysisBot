import React from 'react'
import { shallow, mount, render } from 'enzyme'

import Chat from '../React/js/Component/Chat/Chat'
import ChatMessages from '../React/js/Component/Chat/MessageList'

describe('<Chat />', () => {
  it('renders one <MessageList /> components', () => {
    expect(shallow(<Chat />).contains(<div className="scroll_container" id="scroll"></div>)).toBe(true);
  });
});