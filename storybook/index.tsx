import { getStorybookUI, configure } from '@storybook/react-native';
import loadStories from './storyLoader';

// Configure Storybook to load stories defined in storyLoader
configure(() => {
  loadStories();
}, module);

// Refer to docs for options: disable AsyncStorage for simplicity in RN envs
const StorybookUIRoot = getStorybookUI({ asyncStorage: null });

export default StorybookUIRoot;
