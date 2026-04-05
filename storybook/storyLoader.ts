// Central story loader — require all stories here so Storybook can pick them up.
function loadStories() {
  // Add more story files as you create them
  require('./stories/Button.stories');
}

export default loadStories;
