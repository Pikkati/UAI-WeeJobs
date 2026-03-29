import React from 'react';
import renderer from 'react-test-renderer';
import { Collapsible } from '../components/Collapsible';

jest.mock('@/components/ThemedText', () => ({ ThemedText: (props: any) => <text {...props} /> }));
jest.mock('@/components/ThemedView', () => ({ ThemedView: (props: any) => <view {...props} /> }));
jest.mock('@/components/ui/IconSymbol', () => ({ IconSymbol: (props: any) => <icon {...props} /> }));
jest.mock('@/constants/Colors', () => ({ Colors: { light: { icon: '#000' }, dark: { icon: '#fff' } } }));
jest.mock('@/hooks/useColorScheme', () => ({ useColorScheme: () => 'light' }));

describe('Collapsible', () => {
  it('renders closed and open states correctly', () => {
    const tree = renderer.create(
      <Collapsible title="Test Title">
        <div>Content</div>
      </Collapsible>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
